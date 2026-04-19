const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ─── Storage engines ──────────────────────────────────────────────

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR, 'profiles', req.user.id);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${Date.now()}${ext}`);
  },
});

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR, 'resumes', req.user.id);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume_${Date.now()}.pdf`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR, 'logos', req.user.id);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo_${Date.now()}${ext}`);
  },
});

// ─── File filters ─────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpg, png, webp) are allowed', 400), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed for resume', 400), false);
  }
};

// ─── Multer instances ─────────────────────────────────────────────

const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: parseInt(process.env.MAX_PROFILE_PIC_SIZE) || 2097152 },
  fileFilter: imageFilter,
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: parseInt(process.env.MAX_RESUME_SIZE) || 5242880 },
  fileFilter: pdfFilter,
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: parseInt(process.env.MAX_LOGO_SIZE) || 2097152 },
  fileFilter: imageFilter,
});

// ─── Application resume (for applying to jobs) ────────────────────

const applyResumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR, 'resumes', req.user.id, 'applications');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `apply_resume_${Date.now()}.pdf`);
  },
});

const uploadApplyResume = multer({
  storage: applyResumeStorage,
  limits: { fileSize: parseInt(process.env.MAX_RESUME_SIZE) || 5242880 },
  fileFilter: pdfFilter,
});

module.exports = {
  uploadProfilePic,
  uploadResume,
  uploadLogo,
  uploadApplyResume,
};
