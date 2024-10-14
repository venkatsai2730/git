const crypto = require('crypto');
const aiService = require('../services/aiService');
const githubService = require('../services/githubService');
const Token = require('../models/tokenModel');

exports.handleWebhook = async (req, res) => {
    // Ensure you log the entire headers to diagnose issues
    console.log('Request Headers:', req.headers);
    
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Log the received signature and event for debugging
    console.log('Received Signature:', signature);
    console.log('Event:', event);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Verify signature using the raw body
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
    
    // Use the raw body for signature verification
    const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    // Compare computed digest with the received signature
    if (signature !== digest) {
        console.error('Invalid signature');
        return res.status(401).send('Invalid signature');
    }

    // Handle pull_request event only when the action is 'opened'
    if (event === 'pull_request' && payload.action === 'opened') {
        const pr = payload.pull_request;
        const repo = payload.repository;
        const owner = repo.owner.login;
        const repoName = repo.name;
        const prNumber = pr.number;

        try {
            // Find token by GitHub ID
            const tokenData = await Token.findOne({ githubId: pr.user.id });
            if (!tokenData) {
                console.error('Token not found for GitHub ID:', pr.user.id);
                throw new Error('Token not found');
            }

            const prData = {
                title: pr.title,
                body: pr.body,
                head: pr.head,
                base: pr.base,
                url: pr.url,
                html_url: pr.html_url,
                user: pr.user,
            };

            // Generate AI review
            const review = await aiService.generateReview(prData);

            // Post comment on PR using the stored GitHub access token
            await githubService.postPRComment(tokenData.token, owner, repoName, prNumber, review);

            res.status(200).send('PR reviewed and comment posted');
        } catch (error) {
            console.error('Webhook Processing Error:', error);
            res.status(500).send('Error processing PR');
        }
    } else {
        res.status(200).send('ℹ Event ignored');
    }
};
