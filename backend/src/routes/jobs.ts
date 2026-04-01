import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/jobs — public, with filtering & pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
    const {
        search, skills, location, employmentType, status = 'OPEN',
        page = '1', limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { status };

    if (search) {
        where.OR = [
            { title: { contains: search, options: 'i' } },
            { description: { contains: search, options: 'i' } },
        ];
    }

    if (skills) {
        const skillList = (skills as string).split(',').map(s => s.trim());
        where.techStack = { hasSome: skillList };
    }

    if (location) {
        where.location = { contains: location, options: 'i' };
    }

    if (employmentType) {
        where.employmentType = employmentType;
    }

    try {
        const [jobs, total] = await Promise.all([
            prisma.jobPosting.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    recruiter: { select: { id: true, name: true, email: true } },
                    company: { select: { id: true, name: true, logoUrl: true, location: true } },
                    _count: { select: { applications: true } },
                },
            }),
            prisma.jobPosting.count({ where }),
        ]);

        res.json({
            jobs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Jobs list error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET /api/jobs/recommended — Candidate matching jobs based on their tech stack
router.get('/recommended', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'CANDIDATE') {
        res.status(403).json({ error: 'Only candidates can view recommended jobs' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { skills: true } });
        if (!user || user.skills.length === 0) {
            // Return empty list if user has no skills listed
            res.json({ jobs: [], pagination: { page: 1, limit: 10, total: 0, pages: 1 } });
            return;
        }

        // Get OPEN jobs with at least one matching skill
        const candidateSkillsLower = user.skills.map(s => s.toLowerCase().trim());

        const jobs = await prisma.jobPosting.findMany({
            where: { 
                status: 'OPEN',
            },
            // We fetch all open jobs to rank them by best match if we can't reliably filter case-insensitively with hasSome on Prisma Postgres array, but we can do it in memory for now safely given scale.
            include: {
                recruiter: { select: { id: true, name: true, email: true } },
                company: { select: { id: true, name: true, logoUrl: true, location: true } },
                _count: { select: { applications: true } },
            }
        });

        // Filter & sort jobs in memory by overlapping skillset
        const matchedJobs = jobs.map(job => {
            const jobTech = job.techStack.map(t => t.toLowerCase().trim());
            const matchCount = jobTech.filter(t => candidateSkillsLower.includes(t)).length;
            return { job, matchCount, matchScore: jobTech.length ? Math.round((matchCount / jobTech.length) * 100) : 0 };
        }).filter(m => m.matchScore >= 75) // Only jobs matching 75%+ of required skills
          .sort((a, b) => b.matchScore - a.matchScore); // Best match % first

        res.json({ 
            jobs: matchedJobs.map(m => ({ ...m.job, matchScore: m.matchScore, matchedSkills: m.matchCount })),
            pagination: { page: 1, limit: matchedJobs.length, total: matchedJobs.length, pages: 1 }
        });
    } catch (error) {
        console.error('Recommended jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch recommended jobs' });
    }
});

// GET /api/jobs/:id — public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    try {
        const job = await prisma.jobPosting.findUnique({
            where: { id },
            include: {
                recruiter: { select: { id: true, name: true, email: true } },
                company: { select: { id: true, name: true, logoUrl: true, website: true, description: true, location: true } },
                _count: { select: { applications: true } },
            },
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        res.json({ job });
    } catch (error) {
        console.error('Job fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// POST /api/jobs — Recruiter only
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Only recruiters can post jobs' });
        return;
    }

    const { title, description, techStack, employmentType, location, salaryMin, salaryMax, status } = req.body;

    if (!title || !description) {
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }

    try {
        const company = await prisma.company.findUnique({ where: { recruiterId: req.user!.userId } });

        const job = await prisma.jobPosting.create({
            data: {
                title,
                description,
                techStack: Array.isArray(techStack) ? techStack : (techStack || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                employmentType: employmentType || 'FULL_TIME',
                location: location || null,
                salaryMin: salaryMin ? parseInt(salaryMin) : null,
                salaryMax: salaryMax ? parseInt(salaryMax) : null,
                status: status || 'OPEN',
                recruiterId: req.user!.userId,
                companyId: company?.id || null,
            },
            include: {
                company: { select: { id: true, name: true, logoUrl: true } },
            },
        });

        res.status(201).json({ job });
    } catch (error) {
        console.error('Job create error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// PUT /api/jobs/:id — Recruiter only (own jobs)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Only recruiters can update jobs' });
        return;
    }

    const id = req.params.id as string;
    try {
        const existing = await prisma.jobPosting.findUnique({ where: { id } });
        if (!existing) { res.status(404).json({ error: 'Job not found' }); return; }
        if (existing.recruiterId !== req.user!.userId) { res.status(403).json({ error: 'Not authorized' }); return; }

        const { title, description, techStack, employmentType, location, salaryMin, salaryMax, status } = req.body;

        const job = await prisma.jobPosting.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(techStack && {
                    techStack: Array.isArray(techStack) ? techStack : techStack.split(',').map((s: string) => s.trim()).filter(Boolean),
                }),
                ...(employmentType && { employmentType }),
                ...(location !== undefined && { location }),
                ...(salaryMin !== undefined && { salaryMin: salaryMin ? parseInt(salaryMin) : null }),
                ...(salaryMax !== undefined && { salaryMax: salaryMax ? parseInt(salaryMax) : null }),
                ...(status && { status }),
            },
            include: {
                company: { select: { id: true, name: true, logoUrl: true } },
                _count: { select: { applications: true } },
            },
        });

        res.json({ job });
    } catch (error) {
        console.error('Job update error:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// DELETE /api/jobs/:id — Recruiter only (own jobs)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Only recruiters can delete jobs' });
        return;
    }

    const id = req.params.id as string;
    try {
        const existing = await prisma.jobPosting.findUnique({ where: { id } });
        if (!existing) { res.status(404).json({ error: 'Job not found' }); return; }
        if (existing.recruiterId !== req.user!.userId) { res.status(403).json({ error: 'Not authorized' }); return; }

        await prisma.jobPosting.delete({ where: { id } });
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Job delete error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

// GET /api/jobs/recruiter/mine — Recruiter's own jobs
router.get('/recruiter/mine', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Recruiters only' });
        return;
    }

    try {
        const jobs = await prisma.jobPosting.findMany({
            where: { recruiterId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                company: { select: { id: true, name: true, logoUrl: true } },
                _count: { select: { applications: true } },
            },
        });

        res.json({ jobs });
    } catch (error) {
        console.error('Recruiter jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch your jobs' });
    }
});

export default router;
