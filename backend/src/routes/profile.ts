import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

// GET /api/profile/me
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true, name: true, email: true, role: true,
                bio: true, avatarUrl: true, location: true,
                skills: true, resumeUrl: true, createdAt: true,
                company: {
                    select: { id: true, name: true, logoUrl: true, website: true, location: true, description: true }
                }
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile/me
router.put('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { name, bio, location, skills, resumeUrl } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: req.user!.userId },
            data: {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(location !== undefined && { location }),
                ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()) }),
                ...(resumeUrl !== undefined && { resumeUrl }),
            },
            select: {
                id: true, name: true, email: true, role: true,
                bio: true, avatarUrl: true, location: true,
                skills: true, resumeUrl: true, createdAt: true,
            },
        });

        res.json({ user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /api/profile/avatar
router.post('/avatar', authenticate, (req: Request, res: Response): void => {
    uploadAvatar(req, res, async (err) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        try {
            const avatarUrl = (req.file as Express.Multer.File & { path: string }).path;

            const user = await prisma.user.update({
                where: { id: req.user!.userId },
                data: { avatarUrl },
                select: { id: true, avatarUrl: true },
            });

            res.json({ user });
        } catch (error) {
            console.error('Avatar upload error:', error);
            res.status(500).json({ error: 'Failed to upload avatar' });
        }
    });
});

// POST /api/profile/company – Recruiter creates/updates company profile
router.post('/company', authenticate, async (req: Request, res: Response): Promise<void> => {
    if (req.user!.role !== 'RECRUITER') {
        res.status(403).json({ error: 'Only recruiters can create company profiles' });
        return;
    }

    const { name, description, website, location } = req.body;

    if (!name) {
        res.status(400).json({ error: 'Company name is required' });
        return;
    }

    try {
        const company = await prisma.company.upsert({
            where: { recruiterId: req.user!.userId },
            update: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(website !== undefined && { website }),
                ...(location !== undefined && { location }),
            },
            create: {
                name,
                description: description || null,
                website: website || null,
                location: location || null,
                recruiterId: req.user!.userId,
            },
        });

        res.json({ company });
    } catch (error) {
        console.error('Company upsert error:', error);
        res.status(500).json({ error: 'Failed to save company profile' });
    }
});

export default router;
