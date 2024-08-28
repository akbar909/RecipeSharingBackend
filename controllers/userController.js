// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// // Register a new user
// const registerUser = async (req, res) => {
//     const { name, userName, image, email, password } = req.body;

//     try {
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const userNameExists = await User.findOne({ userName });
//         if (userNameExists) {
//             return res.status(400).json({ message: 'Username already taken' });
//         }

//         const user = await User.create({
//             name,
//             userName,
//             image,
//             email,
//             password,
//         });

//         if (user) {
//             res.status(201).json({
//                 _id: user._id,
//                 name: user.name,
//                 userName: user.userName,
//                 email: user.email,
//                 token: generateToken(user._id),
//             });
//         } else {
//             res.status(400).json({ message: 'Invalid user data' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Authenticate a user
// const authUser = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user || !(await user.matchPassword(password))) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         const token = generateToken(user._id);

//         res.json({
//             _id: user._id,
//             name: user.name,
//             userName: user.userName,
//             email: user.email,
//             token,
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Get user profile
// const getUserProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.json({
//             _id: user._id,
//             name: user.name,
//             userName: user.userName,
//             image: user.image,
//             email: user.email,
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Check username availability
// const checkUsernameAvailability = async (req, res) => {
//     const { userName } = req.params;

//     try {
//         const userNameExists = await User.findOne({ userName });
//         if (userNameExists) {
//             return res.status(400).json({ message: 'Username already taken' });
//         }

//         res.status(200).json({ message: 'Username available' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// const deleteUserById = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const user = await User.findByIdAndDelete(id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.status(200).json({ message: 'User deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Get all users (Admin only)
// const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find({}).select('-password'); // Exclude passwords from response
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };



// // Generate JWT token
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '30d',
//     });
// };

// module.exports = {
//     registerUser,
//     authUser,
//     getUserProfile,
//     checkUsernameAvailability,
//     deleteUserById,
//     getAllUsers

// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const getDataUri = require('../utils/datauri');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');
// Register a new user

const registerUser = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading image', error: err });
        }

        const { name, userName, email, password } = req.body;
        let imageUrl = '';

        try {
            // Debugging: Check if file is received
            if (req.file) {
                // console.log('File received:', req.file);

                const fileUri = getDataUri(req.file);
                // console.log('Data URI:', fileUri);

                const myCloud = await cloudinary.uploader.upload(fileUri, {
                    folder: 'images',
                });

                // console.log('Cloudinary response:', myCloud);
                imageUrl = myCloud.secure_url;
            }

            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const userNameExists = await User.findOne({ userName });
            if (userNameExists) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            const user = await User.create({
                name,
                userName,
                image: imageUrl,
                email,
                password,
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    userName: user.userName,
                    email: user.email,
                    token: generateToken(user._id),
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    });
};


// Authenticate a user
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            userName: user.userName,
            image: user.image,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            userName: user.userName,
            image: user.image,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Check username availability
const checkUsernameAvailability = async (req, res) => {
    const { userName } = req.params;

    try {
        const userNameExists = await User.findOne({ userName });
        if (userNameExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        res.status(200).json({ message: 'Username available' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude passwords from response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};



// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    checkUsernameAvailability,
    deleteUserById,
    getAllUsers

};
