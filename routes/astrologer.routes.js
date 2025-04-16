const express = require('express');
const { 
  listAstrologers, 
  getAstrologerProfile, 
  updateAstrologerProfile,
  getFilterOptions,
} = require('../controllers/astrologer.controller');
const {
  createSpecialization,
  getAllSpecializations,
  deleteSpecialization
} = require('../controllers/specialization.controller');
const { auth, isAstrologer, isAdmin, isAdminOrAstrologer } = require('../middlewares/auth');
const verifyToken = require('../utils/verifyUser');

const router = express.Router();

// Public routes
router.get('/filter-options', getFilterOptions); 
router.get('/', listAstrologers);
router.get('/:id', getAstrologerProfile);
router.get('/specializations/list', getAllSpecializations);

// Protected routes - Astrologer only
router.put('/update/:astrologerId', verifyToken, isAstrologer, updateAstrologerProfile);

// Protected routes - Admin Or Astrologer only
router.post('/specializations/create', verifyToken, isAdminOrAstrologer, createSpecialization);

// Protected routes - Admin only
router.delete('/specializations/:id', verifyToken, isAdmin, deleteSpecialization);


module.exports = router;