import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

/** Calculate a simple match score: % of job's techStack found in candidate's skills */
function calcMatchScore(jobTechStack: string[], candidateSkills: string[]): number {
    if (!jobTechStack.length) return 0;
    const normalised = candidateSkills.map(s => s.toLowerCase());
    const matched = jobTechStack.filter(t => normalised.includes(t.toLowerCase()));
    return Math.round((matched.length / jobTechStack.length) * 100);
}

// POST /api/applications/:jobId — Candidate applies (with resume upload)
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
        const uploadedResumeUrl = req.file ? (req.file as Express.Multer.File & { path: string }).path : null;
        const resolvedResumeUrl = uploadedResumeUrl || bodyResumeUrl;

        if (!resolvedResumeUrl) {
            res.status(400).json({ error: 'A resume is required to apply (upload a PDF or provide a URL)' });
            return;
        }

        try {
            const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
            if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
            if (job.status !== 'OPEN') { res.status(400).json({ error: 'This job is not accepting applications' }); return; }

            const candidate = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { skills: true } });

            const matchScore = calcMatchScore(job.techStack, candidate?.skills || []);

            const application = await prisma.application.create({
                data: {
                    resumeUrl: resolvedResumeUrl,
                    coverLetter: coverLetter || null,
                    matchScore,
                    candidateId: req.user!.userId,
                    jobId,
                },
                include: {
                    job: { select: { id: true, title: true, status: true } },
                },
            });

            res.status(201).json({ application });
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

// POST /api/applications/saved/:jobId — Save/unsave a job (Candidate)
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

export default router;
