const express = require('express');
const {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    getRecipesByEmail,
    likeRecipe,
    addComment,
    deleteRecipe,
    editComment,
    getRecipesByUserName
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createRecipe);


router.get('/', protect, getAllRecipes);

router.get('/:id', protect, getRecipeById);

router.get('/byemail/:email', protect, getRecipesByEmail);
router.get('/user/:userName', protect, getRecipesByUserName);

router.post('/:id/like', protect, likeRecipe);

router.post('/:id/comment/', protect, addComment);

router.put('/:recipeId/comment/:commentId', protect, editComment);


router.delete('/:id', protect, deleteRecipe);

module.exports = router;
