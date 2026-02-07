const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes', // The folder in Cloudinary
    allowed_formats: ['pdf'], // Restrict to PDF
    resource_type: 'auto', // Let Cloudinary decide (usually 'image' for valid PDFs, 'raw' for others)
    format: async (req, file) => 'pdf', 
    public_id: (req, file) => `resume_${req.params.userId || 'user'}_${Date.now()}`,
    access_mode: 'public', // Explicitly request public access
  },
});

const courseStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'course_content',
        resource_type: 'auto', // Important for video/pdf
        allowed_formats: ['jpg', 'png', 'pdf', 'mp4', 'mkv', 'mov'],
        public_id: (req, file) => `course_${req.params.id || 'content'}_${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

const upload = multer({ storage: storage });
const courseUpload = multer({ storage: courseStorage });

module.exports = { upload, courseUpload, cloudinary };
