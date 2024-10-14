const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const githubRoutes = require('./routes/githubRoutes');

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;  // Store the raw body in req.rawBody
    }
}));

app.use(express.json());
app.use('/github', githubRoutes);

const PORT = process.env.PORT || 5000;

// MongoDB connection (Store OAuth tokens)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
