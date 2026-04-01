import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Determine folder based on file type or route if needed
        let folder = 'hackflow-uploads';
        let resource_type = 'auto'; // auto detects image/video/raw

        // Optional: Customize public_id or format here
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        return {
            folder: folder,
            resource_type: resource_type,
            // public_id: file.fieldname + '-' + uniqueSuffix, // Optional custom public_id
        };
    },
});

export { cloudinary, storage };
