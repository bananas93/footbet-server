import multer from 'multer';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = process.env.NODE_ENV === 'production' ? 'dist/uploads/' : 'src/uploads/';
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Create the multer instance
const upload = multer({ storage });

export default upload;
