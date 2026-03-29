import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary';

const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder: 'careerbridge/resumes',
        resource_type: 'raw',
        format: file.mimetype === 'application/pdf' ? 'pdf' : undefined,
        public_id: `resume_${Date.now()}`,
    }),
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'careerbridge/avatars',
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        public_id: `avatar_${Date.now()}`,
    }),
});

export const uploadResume = multer({
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resumes'));
        }
    },
}).single('resume');

export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for avatars'));
        }
    },
}).single('avatar');
