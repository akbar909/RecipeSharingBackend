const express = require('express');
const {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    getRecipesByEmail,
    likeRecipe,
    addComment,
    deleteRecipe
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createRecipe);


router.get('/', protect, getAllRecipes);

router.get('/:id', protect, getRecipeById);

router.get('/byemail/:email', protect, getRecipesByEmail);

router.post('/:id/like', protect, likeRecipe);

router.post('/:id/comment', protect, addComment);

router.delete('/:id', protect, deleteRecipe);

module.exports = router;
