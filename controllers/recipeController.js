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
        const recipes = await Recipe.find().populate('user', 'name email');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRecipeById = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId).populate('user', 'name email');

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

        const recipes = await Recipe.find({ user: user._id }).populate('user', 'name email');
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

        const userEmail = req.user.email; // Ensure you use email instead of user ID

        // Check if the user has already liked the recipe
        const likeIndex = recipe.likes.findIndex(like => like.userEmail === userEmail);

        if (likeIndex > -1) {
            // User already liked the recipe, remove the like
            recipe.likes.splice(likeIndex, 1);
        } else {
            // User has not liked the recipe, add the like
            recipe.likes.push({ userEmail: req.user.email });
        }

        await recipe.save();

        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error in likeRecipe:', error);
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
            user: req.user._id,
            text: req.body.text,
            date: new Date(),
        };

        recipe.comments.push(newComment);
        await recipe.save();

        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


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
    deleteRecipe
};
