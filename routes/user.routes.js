const express = require('express');
const { deleteUser, updateUser, getUser, searchProfiles, listAllProfiles, getProfileById, deleteProfileById } = require('../controllers/user.controller.js');
const verifyToken = require('../utils/verifyUser.js');
const { isAdmin } = require('../middlewares/auth.js');

const router = express.Router();

router.get('/profile', verifyToken, getUser);
router.put('/update', verifyToken, updateUser);
router.delete('/delete', verifyToken, deleteUser);

// Admin Routes Only
router.get('/users/search',verifyToken, isAdmin, searchProfiles);
router.get('/users',verifyToken,isAdmin, listAllProfiles);
router.get('/users/:id',verifyToken,isAdmin, getProfileById);
router.delete('/users/:id',verifyToken,isAdmin, deleteProfileById);

module.exports = router;
