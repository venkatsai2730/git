const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const webhookController = require('../controllers/webhookController');

// Route for GitHub OAuth
router.get('/oauth', githubController.getOAuthUrl);

// OAuth callback route
router.get('/callback', githubController.handleOAuthCallback);

router.get('/status', githubController.authStatus);

// Webhook handler for GitHub PR events
router.post('/webhook', webhookController.handleWebhook);

module.exports = router;
