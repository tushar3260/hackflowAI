import multer from 'multer';
import { storage } from '../config/cloudinary.js';

// File filter (Optional: Cloudinary handles most types, but good to restrict)
const fileFilter = (req, file, cb) => {
    // Basic check for allowed types if needed, or let Cloudinary handle it
    // For now, allowing typical files
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    // fileFilter: fileFilter // Can re-enable if strict filtering is needed
});

export default upload;
