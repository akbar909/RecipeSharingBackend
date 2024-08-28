const express = require('express');
const { urlencoded } = express;
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());
app.use(urlencoded({ limit: '20mb', extended: true }));

app.use(cors({
  origin: ['https://recipe-sharing-frontend.vercel.app'],
  methods: ['GET', 'POST', 'PUT','DELETE'],
  credentials: true
}))
app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.send('Hello World');
});
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
