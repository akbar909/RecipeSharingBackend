const express = require('express');
const { registerUser, authUser, getUserProfile, checkUsernameAvailability, deleteUserById,getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
// const upload = require('../middleware/multer')
const router = express.Router();

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.delete('/delete/:id',deleteUserById)
router.get('/all', protect, getAllUsers);
router.get('/check-userName/:userName', checkUsernameAvailability);

module.exports = router;
