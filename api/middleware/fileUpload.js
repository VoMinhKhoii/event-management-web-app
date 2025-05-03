import multer from "multer";
import path from 'path';
import { fileURLToPath } from "url";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });
console.log('File uploads will be stored in:', uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // save uploads 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar' + uniqueSuffix + ext);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPG, PNG and WebP images are allowed'));
        }
        cb(null, true);
    }
});
export default upload;
