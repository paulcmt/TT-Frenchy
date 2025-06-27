const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TravelerController = require('../controllers/travelerController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Import routes (must come before parameter routes)
router.get('/import/new', TravelerController.importForm);
router.post('/import', upload.single('csvFile'), TravelerController.import);
router.post('/import/preview', upload.single('csvFile'), TravelerController.previewCSV);

// API Routes (must come before parameter routes)
router.get('/api', TravelerController.apiIndex);
router.get('/api/:id', TravelerController.apiShow);
router.post('/api', TravelerController.apiCreate);
router.put('/api/:id', TravelerController.apiUpdate);
router.delete('/api/:id', TravelerController.apiDestroy);

// MVC Routes (Server-side rendering)
router.get('/', TravelerController.index);
router.get('/new', TravelerController.new);
router.post('/', TravelerController.create);
router.get('/:id', TravelerController.show);
router.get('/:id/edit', TravelerController.edit);
router.put('/:id', TravelerController.update);
router.delete('/:id', TravelerController.destroy);
router.post('/:id/stays', TravelerController.addStay);
router.get('/:id/stays/:stayId/edit', TravelerController.editStay);
router.put('/:id/stays/:stayId', TravelerController.updateStay);
router.delete('/:id/stays/:stayId', TravelerController.deleteStay);

module.exports = router; 