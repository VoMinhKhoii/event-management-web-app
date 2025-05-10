import multer from "multer";
import path from 'path';
import { fileURLToPath } from "url";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'uploads');

const ensureUploadDirExists = () => {
    try {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            console.log(`Created upload directory at: ${UPLOAD_DIR}`);
        }
        return UPLOAD_DIR;
    } catch (err) {
        console.error(`Failed to create upload directory: ${err}`);
        throw new Error(`Could not create upload directory: ${err.message}`); // Rethrow to prevent further execution
    }
};

const uploadDir = ensureUploadDirExists();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // save uploads 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }, // 5MB limit, 1 file only
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPG, PNG and WebP images are allowed'));
        }
        cb(null, true);
    }
});