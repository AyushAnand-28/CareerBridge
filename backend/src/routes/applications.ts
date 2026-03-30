import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { uploadResume, uploadBufferToCloudinary } from '../middleware/upload';
import { extractTextFromBuffer } from '../utils/pdfParser';
import { analyzeResumeMatch } from '../utils/ai';

const router = Router();

// POST /api/applications/saved/:jobId — Save/unsave a job (Candidate)
// ⚠️  Must be declared BEFORE POST /:jobId — otherwise Express matches 'saved' as a jobId
router.post('/saved/:jobId', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'CANDIDATE') {
        res.status(403).json({ error: 'Candidates only' });
        return;
    }

    const jobId = req.params.jobId as string;
    try {
        const existing = await prisma.savedJob.findUnique({
            where: { candidateId_jobId: { candidateId: req.user!.userId, jobId } },
        });

        if (existing) {
            await prisma.savedJob.delete({ where: { id: existing.id } });
            res.json({ saved: false });
        } else {
            await prisma.savedJob.create({
                data: { candidateId: req.user!.userId, jobId },
            });
            res.json({ saved: true });
        }
    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({ error: 'Failed to toggle saved job' });
    }
});

// POST /api/applications/:jobId — Candidate applies (PDF → parse → AI score → Cloudinary)
router.post('/:jobId', authenticate, (req: Request, res: Response): void => {
    if (req.user!.role !== 'CANDIDATE') {
        res.status(403).json({ error: 'Only candidates can apply to jobs' });
        return;
    }

    uploadResume(req, res, async (err) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        const jobId = req.params.jobId as string;
        const { coverLetter, resumeUrl: bodyResumeUrl } = req.body;

        try {
            const [job, candidate] = await Promise.all([
                prisma.jobPosting.findUnique({ where: { id: jobId } }),
                prisma.user.findUnique({ where: { id: req.user!.userId }, select: { skills: true, name: true, resumeUrl: true } }),
            ]);

            if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
            if (job.status !== 'OPEN') { res.status(400).json({ error: 'This job is not accepting applications' }); return; }

            // ── Determine resume URL ────────────────────────────────────────────
            let resolvedResumeUrl: string | null = bodyResumeUrl || candidate?.resumeUrl || null;
            let pdfBuffer: Buffer | null = null;

            if (req.file?.buffer) {
                pdfBuffer = req.file.buffer;
            }

            if (!pdfBuffer && !resolvedResumeUrl) {
                res.status(400).json({ error: 'A resume is required to apply (upload a PDF or provide a URL in your profile)' });
                return;
            }

            // ── Step 1: Upload PDF to Cloudinary (if file uploaded) ─────────
            if (pdfBuffer) {
                try {
                    const cloudinaryUrl = await uploadBufferToCloudinary(
                        pdfBuffer,
                        req.file!.originalname,
                    );
                    resolvedResumeUrl = cloudinaryUrl;
                } catch (uploadErr) {
                    console.warn('[Upload] Cloudinary upload failed, using profile URL:', uploadErr);
                    // Fall back — don't block the application
                    resolvedResumeUrl = candidate?.resumeUrl || null;
                }
            }

            if (!resolvedResumeUrl) {
                res.status(400).json({ error: 'Resume upload failed and no fallback URL found on profile.' });
                return;
            }

            // ── Step 2: Extract text from PDF buffer ─────────────────────────
            let resumeText = '';
            let pdfExtracted = false;

            // If no file was uploaded right now, fetch the resume from the profile URL
            if (!pdfBuffer && resolvedResumeUrl) {
                console.log(`[PDF] No file uploaded, fetching profile PDF from: ${resolvedResumeUrl}`);
                try {
                    // Disable strict TLS briefly (helps bypass OS proxy/antivirus SSL issues)
                    const originalTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

                    // Automatically convert Google Drive view links to direct download links
                    let fetchUrl = resolvedResumeUrl;
                    const gDriveMatch = fetchUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (gDriveMatch) {
                        fetchUrl = `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
                        console.log(`[PDF] Converted Google Drive link to direct download: ${fetchUrl}`);
                    }

                    const response = await fetch(fetchUrl);

                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTls;

                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        pdfBuffer = Buffer.from(arrayBuffer);
                    } else {
                        console.warn(`[PDF] Failed to fetch profile PDF: ${response.status} ${response.statusText}`);
                    }
                } catch (fetchErr) {
                    console.error('[PDF] Error fetching profile PDF:', fetchErr);
                }
            }

            if (pdfBuffer) {
                resumeText = await extractTextFromBuffer(pdfBuffer);
                pdfExtracted = resumeText.length > 50; // meaningful extraction threshold
                console.log(`[PDF] Buffer size: ${pdfBuffer.length} bytes`);
                console.log(`[PDF] Extracted text length: ${resumeText.length} chars | Success: ${pdfExtracted}`);
                console.log(`[PDF] First 300 chars: ${resumeText.slice(0, 300)}`);
                if (!pdfExtracted) {
                    console.warn('[PDF] Extraction returned very little text — PDF may be image-based or encrypted.');
                }
            } else {
                console.log('[PDF] No file buffer and could not fetch profile PDF — scoring with profile skills only.');
            }

            // ── Step 3: AI / keyword match scoring ───────────────────────────
            console.log(`[AI] Job tech stack: ${job.techStack.join(', ')}`);
            console.log(`[AI] Profile skills: ${(candidate?.skills || []).join(', ')}`);
            const { score: matchScore, analysis: aiAnalysis } = await analyzeResumeMatch(
                resumeText,
                job.title,
                job.description,
                job.techStack,
                candidate?.skills || [],
            );
            console.log(`[AI] Score: ${matchScore} | Analysis: ${aiAnalysis.slice(0, 120)}`);

            // ── Step 4: Persist application ──────────────────────────────────
            const application = await prisma.application.create({
                data: {
                    resumeUrl: resolvedResumeUrl,
                    coverLetter: coverLetter || null,
                    matchScore,
                    aiAnalysis,
                    candidateId: req.user!.userId,
                    jobId,
                },
                include: {
                    job: { select: { id: true, title: true, status: true } },
                },
            });

            res.status(201).json({
                application,
                aiAnalysis,
                matchScore,
                pdfExtracted,
                scoringNote: !pdfBuffer
                    ? 'Scored using profile skills only (no PDF uploaded)'
                    : !pdfExtracted
                    ? 'PDF could not be read as text (may be image/scanned). Scored using profile skills only.'
                    : 'Scored using extracted PDF text content.',
            });
        } catch (error: unknown) {
            if ((error as { code?: string }).code === 'P2002') {
                res.status(409).json({ error: 'You have already applied to this job' });
                return;
            }
            console.error('Application create error:', error);
            res.status(500).json({ error: 'Failed to submit application' });
        }
    });
});

// GET /api/applications/me — Candidate's own applications
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'CANDIDATE') {
        res.status(403).json({ error: 'Candidates only' });
        return;
    }

    try {
        const applications = await prisma.application.findMany({
            where: { candidateId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                job: {
                    include: {
                        company: { select: { id: true, name: true, logoUrl: true } },
                    },
                },
            },
        });

        res.json({ applications });
    } catch (error) {
        console.error('My applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /api/applications/job/:jobId — Recruiter views applicants for a job
router.get('/job/:jobId', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Recruiters only' });
        return;
    }

    const jobId = req.params.jobId as string;
    try {
        const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
        if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
        if (job.recruiterId !== req.user!.userId) { res.status(403).json({ error: 'Not authorized' }); return; }

        const applications = await prisma.application.findMany({
            where: { jobId },
            orderBy: [{ matchScore: 'desc' }, { createdAt: 'asc' }],
            include: {
                candidate: {
                    select: { id: true, name: true, email: true, avatarUrl: true, skills: true, location: true },
                },
            },
        });

        res.json({ applications });
    } catch (error) {
        console.error('Job applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// PUT /api/applications/:id/status — Recruiter updates status
router.put('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Recruiters only' });
        return;
    }

    const { status } = req.body;
    const validStatuses = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'ACCEPTED'];

    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
        return;
    }

    const appId = req.params.id as string;
    try {
        const application = await prisma.application.findUnique({
            where: { id: appId },
            include: { job: { select: { recruiterId: true } } },
        });

        if (!application) { res.status(404).json({ error: 'Application not found' }); return; }
        if (application.job.recruiterId !== req.user!.userId) { res.status(403).json({ error: 'Not authorized' }); return; }

        const updated = await prisma.application.update({
            where: { id: appId },
            data: { status },
            include: {
                candidate: { select: { id: true, name: true, email: true } },
                job: { select: { id: true, title: true } },
            },
        });

        res.json({ application: updated });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/applications/:id — Candidate withdraws their own application
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'CANDIDATE') {
        res.status(403).json({ error: 'Only candidates can withdraw applications' });
        return;
    }

    const appId = req.params.id as string;
    try {
        const application = await prisma.application.findUnique({
            where: { id: appId },
        });

        if (!application) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }

        if (application.candidateId !== req.user!.userId) {
            res.status(403).json({ error: 'You can only withdraw your own applications' });
            return;
        }

        if (application.status !== 'APPLIED') {
            res.status(400).json({
                error: `Cannot withdraw an application with status "${application.status}". Only APPLIED applications can be withdrawn.`,
            });
            return;
        }

        await prisma.application.delete({ where: { id: appId } });
        res.json({ message: 'Application withdrawn successfully' });
    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ error: 'Failed to withdraw application' });
    }
});

export default router;

