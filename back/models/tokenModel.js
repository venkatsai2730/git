const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true,
    },
    username: String,
    accessToken: String,
});

module.exports = mongoose.model('Token', tokenSchema);
