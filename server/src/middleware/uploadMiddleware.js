const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|zip|jpeg|jpg|png/;
    // Check ext
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = allowedTypes.test(file.mimetype) ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.mimetype === 'application/vnd.ms-powerpoint' ||
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-zip-compressed';

    if (extname) { // trusting extname more for some office types often causing mime issues
        return cb(null, true);
    } else {
        cb(new Error('Error: File type not allowed! (Allowed: Valid Docs, PPT, Images, ZIP)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;
