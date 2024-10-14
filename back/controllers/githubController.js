const axios = require('axios');
const Token = require('../models/tokenModel');

// GitHub OAuth flow (Step 1: Redirect user to GitHub OAuth)
exports.getOAuthUrl = (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/github/callback`;
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
    res.json({ url: oauthUrl });
};

// GitHub OAuth callback (Step 2: Handle OAuth callback)
exports.handleOAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // Step 1: Make a POST request to GitHub to exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, {
            headers: { Accept: 'application/json' },
        });

        // Step 2: Check if the token exists in the response
        const token = tokenResponse.data.access_token;

        if (!token) {
            console.error('GitHub OAuth: Access token not found in response:', tokenResponse.data);
            return res.status(400).json({ error: 'Failed to retrieve access token from GitHub' });
        }

        // Step 3: Fetch the GitHub user profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const githubId = userResponse.data.id;

        // Step 4: Save the token and githubId to the database
        await Token.create({ token, githubId });

        // Step 5: Send a successful response back to the client
        res.json({ success: true, token });
    } catch (error) {
        // Log the error and send an appropriate response
        console.error('Error during GitHub OAuth callback:', error.message);
        res.status(500).json({ error: 'GitHub OAuth callback failed' });
    }
};
exports.authStatus = async (req, res) => {
    // For simplicity, assuming token is sent via query parameters
    const token = req.query.token;

    if (!token) {
        return res.json({ isAuthenticated: false });
    }

    try {
        // Verify token by fetching user info
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${token}`,
            },
        });

        const { id, login } = userResponse.data;

        // Find user in the database
        const user = await User.findOne({ githubId: id });

        if (user && user.accessToken === token) {
            return res.json({ isAuthenticated: true, user: { username: login } });
        } else {
            return res.json({ isAuthenticated: false });
        }
    } catch (error) {
        console.error('❌ Authentication Status Error:', error);
        res.json({ isAuthenticated: false });
    }
};

