const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

const createRecipe = async (req, res) => {
    const { title, description, ingredients, steps, image ,likes } = req.body;

    try {
        const recipe = new Recipe({
            user: req.user._id,
            title,
            description,
            ingredients,
            steps,
            image,
            likes: []
        });

        const createdRecipe = await recipe.save();
        res.status(201).json(createdRecipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('user', 'name image email');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRecipeById = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId)
            .populate('user', 'name image')
            .populate('comments.user', 'name image');

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const getRecipesByEmail = async (req, res) => {
    try {
        const userEmail = req.params.email; 
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipes = await Recipe.find({ user: user._id }).populate('user', 'name image email');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRecipesByUserName = async (req, res) => {
    try {
        const userName = decodeURIComponent(req.params.userName);
        // console.log('Received userName:', userName); // For debugging

        const user = await User.findOne({ name: userName });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipes = await Recipe.find({ user: user._id }).populate('user', 'name image');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const likeRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const userEmail = req.user.email;

        const liked = recipe.likes.some(like => like.userEmail === userEmail);

        if (liked) {
            recipe.likes = recipe.likes.filter(like => like.userEmail !== userEmail);
        } else {
            recipe.likes.push({ userEmail });
        }

        await recipe.save();

        const updatedRecipe = await Recipe.findById(req.params.id)
            .populate('user', 'name image')
            .populate('comments.user', 'name image');

        res.json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const addComment = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const newComment = {
            user: req.user.id, // assuming req.user.id contains the ID of the logged-in user
            text: req.body.text,
        };

        recipe.comments.push(newComment);
        await recipe.save();

        const updatedRecipe = await Recipe.findById(req.params.id)
            .populate('user', 'name image')
            .populate('comments.user', 'name image');

        res.json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const editComment = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const comment = recipe.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        // Update the comment text
        comment.text = req.body.text;
        await recipe.save();

        const updatedRecipe = await Recipe.findById(req.params.recipeId)
            .populate('user', 'name image')
            .populate('comments.user', 'name image');

        res.json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// const deleteComment = async (req, res) => {
//     try {
//         // Log the incoming request parameters
//         console.log(`Deleting comment ${req.params.commentId} from recipe ${req.params.recipeId}`);

//         // Find the recipe by ID
//         const recipe = await Recipe.findById(req.params.recipeId);

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         // Find the comment by ID within the recipe's comments
//         const comment = recipe.comments.id(req.params.commentId);

//         if (!comment) {
//             return res.status(404).json({ message: 'Comment not found' });
//         }

//         // Check if the logged-in user is the owner of the comment or the recipe
//         if (comment.user.toString() !== req.user.id.toString() && recipe.user.toString() !== req.user.id.toString()) {
//             return res.status(403).json({ message: 'Not authorized to delete this comment' });
//         }

//         // Remove the comment
//         comment.remove();

//         // Save the updated recipe
//         await recipe.save();

//         // Fetch and return the updated recipe with populated fields
//         const updatedRecipe = await Recipe.findById(req.params.recipeId)
//             .populate('user', 'name image')
//             .populate('comments.user', 'name image');

//         res.json(updatedRecipe);
//     } catch (error) {
//         // Log the error details
//         console.error('Error deleting comment:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };





const deleteRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the logged-in user is the owner of the recipe
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this recipe' });
        }

        await Recipe.findByIdAndDelete(recipeId);

        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    getRecipesByEmail,
    likeRecipe,
    addComment,
    deleteRecipe,
    editComment,
    getRecipesByUserName
};
