// const mongoose = require('mongoose');
// const Recipe = require('../models/Recipe');
// const User = require('../models/User');

// const createRecipe = async (req, res) => {
//     const { title, description, ingredients, steps, image ,likes } = req.body;

//     try {
//         const recipe = new Recipe({
//             user: req.user._id,
//             title,
//             description,
//             ingredients,
//             steps,
//             image,
//             likes: []
//         });

//         const createdRecipe = await recipe.save();
//         res.status(201).json(createdRecipe);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const getAllRecipes = async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('user', 'name userName image email');
//         res.json(recipes);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const getRecipeById = async (req, res) => {
//     try {
//         const recipeId = req.params.id;
//         const recipe = await Recipe.findById(recipeId)
//             .populate('user', 'name image')
//             .populate('comments.user', 'name image');

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         res.json(recipe);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// const getRecipesByEmail = async (req, res) => {
//     try {
//         const userEmail = req.params.email; 
//         const user = await User.findOne({ email: userEmail });
        
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const recipes = await Recipe.find({ user: user._id }).populate('user', 'name image email');
//         res.json(recipes);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const getRecipesByUserName = async (req, res) => {
//     try {
//         const userName = decodeURIComponent(req.params.userName);

//         // Search for the user by their unique userName
//         const user = await User.findOne({ userName });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const recipes = await Recipe.find({ user: user._id }).populate('user', 'name image');
//         res.json(recipes);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// const likeRecipe = async (req, res) => {
//     try {
//         const recipe = await Recipe.findById(req.params.id);

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         const userEmail = req.user.email;

//         const liked = recipe.likes.some(like => like.userEmail === userEmail);

//         if (liked) {
//             recipe.likes = recipe.likes.filter(like => like.userEmail !== userEmail);
//         } else {
//             recipe.likes.push({ userEmail });
//         }

//         await recipe.save();

//         const updatedRecipe = await Recipe.findById(req.params.id)
//             .populate('user', 'name image')
//             .populate('comments.user', 'name image');

//         res.json(updatedRecipe);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const addComment = async (req, res) => {
//     try {
//         const recipe = await Recipe.findById(req.params.id);

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         const newComment = {
//             user: req.user.id,
//             text: req.body.text,
//         };

//         recipe.comments.push(newComment);
//         await recipe.save();

//         const updatedRecipe = await Recipe.findById(req.params.id)
//             .populate('user', 'name image')
//             .populate('comments.user', 'name image');

//         res.json(updatedRecipe);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// const editComment = async (req, res) => {
//     try {
//         const recipe = await Recipe.findById(req.params.recipeId);

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         const comment = recipe.comments.id(req.params.commentId);

//         if (!comment) {
//             return res.status(404).json({ message: 'Comment not found' });
//         }

//         // Check if the logged-in user is the owner of the comment
//         if (comment.user.toString() !== req.user.id.toString()) {
//             return res.status(403).json({ message: 'Not authorized to edit this comment' });
//         }

//         // Update the comment text
//         comment.text = req.body.text;
//         await recipe.save();

//         const updatedRecipe = await Recipe.findById(req.params.recipeId)
//             .populate('user', 'name image')
//             .populate('comments.user', 'name image');

//         res.json(updatedRecipe);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const deleteRecipe = async (req, res) => {
//     try {
//         const recipeId = req.params.id;
//         const recipe = await Recipe.findById(recipeId);

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         // Check if the logged-in user is the owner of the recipe
//         if (recipe.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: 'Not authorized to delete this recipe' });
//         }

//         await Recipe.findByIdAndDelete(recipeId);

//         res.status(200).json({ message: 'Recipe deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// module.exports = {
//     createRecipe,
//     getAllRecipes,
//     getRecipeById,
//     getRecipesByEmail,
//     likeRecipe,
//     addComment,
//     deleteRecipe,
//     editComment,
//     getRecipesByUserName
// };


const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const getDataUri = require('../utils/datauri');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');
// Create a new recipe
const createRecipe = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading image', error: err });
        }

        const { title, description, ingredients, steps } = req.body;
        let recipeImage = '';

        try {
            // If an image is uploaded, process it
            if (req.file) {
                const fileUri = getDataUri(req.file);
                const myCloud = await cloudinary.uploader.upload(fileUri, {
                    folder: 'recipe_images',
                });

                recipeImage = myCloud.secure_url;
            }

            // Create the new recipe
            const recipe = new Recipe({
                user: req.user._id,
                title,
                description,
                ingredients,
                steps,
                image: recipeImage,  // Save the uploaded image URL
                likes: [],
            });

            const createdRecipe = await recipe.save();
            res.status(201).json(createdRecipe);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    });
};


// Get all recipes
const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('user', 'name userName image email');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a recipe by ID
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
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

// Get recipes by user email
const getRecipesByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipes = await Recipe.find({ user: user._id }).populate('user', 'name image email');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recipes by userName
const getRecipesByUserName = async (req, res) => {
    try {
        const user = await User.findOne({ userName: decodeURIComponent(req.params.userName) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipes = await Recipe.find({ user: user._id }).populate('user', 'name image');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Like or unlike a recipe
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

// Add a comment to a recipe
const addComment = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const newComment = {
            user: req.user.id,
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

// Edit a comment
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

        if (comment.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

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

// Delete a recipe
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this recipe' });
        }

        await Recipe.findByIdAndDelete(req.params.id);

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
    getRecipesByUserName,
    likeRecipe,
    addComment,
    editComment,
    deleteRecipe,
};
