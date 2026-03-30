import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary';

/**
 * Resume upload uses MEMORY storage so the raw buffer is available
 * for PDF text extraction before we manually push it to Cloudinary.
 */
export const uploadResume = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resumes'));
        }
    },
}).single('resume');

/**
 * Upload a PDF buffer to Cloudinary and return the secure URL.
 */
export function uploadBufferToCloudinary(buffer: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'careerbridge/resumes',
                resource_type: 'raw',
                public_id: `resume_${Date.now()}_${filename.replace(/[^a-z0-9]/gi, '_')}`,
                format: 'pdf',
            },
            (error, result) => {
                if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
                resolve(result.secure_url);
            },
        );
        uploadStream.end(buffer);
    });
}

/**
 * Avatar upload keeps Cloudinary storage directly (no parsing needed).
 */
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'careerbridge/avatars',
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        public_id: `avatar_${Date.now()}`,
    }),
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for avatars'));
        }
    },
}).single('avatar');
