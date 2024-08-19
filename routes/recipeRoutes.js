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
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createRecipe);


router.get('/', protect, getAllRecipes);

router.get('/:id', protect, getRecipeById);

router.get('/byemail/:email', protect, getRecipesByEmail);

router.post('/:id/like', protect, likeRecipe);

router.post('/:id/comment/', protect, addComment);

router.put('/:recipeId/comment/:commentId', protect, editComment);
// router.delete('/:recipeId/comment/::commentId', protect, deleteComment);

router.delete('/:id', protect, deleteRecipe);

module.exports = router;
