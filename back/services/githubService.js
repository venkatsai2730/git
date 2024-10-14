const axios = require('axios');

exports.registerWebhooks = async (accessToken) => {
    try {
        // Fetch all repositories of the user
        const reposResponse = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `token ${accessToken}`,
                'User-Agent': 'GitHub-PR-Reviewer',
            },
        });

        const repos = reposResponse.data;

        for (const repo of repos) {
            // Create a webhook for each repository
            await axios.post(
                `https://api.github.com/repos/${repo.owner.login}/${repo.name}/hooks`,
                {
                    name: 'web',
                    active: true,
                    events: ['pull_request'],
                    config: {
                        url: `${process.env.BACKEND_URL}/webhook/github`,
                        content_type: 'json',
                        secret: process.env.GITHUB_WEBHOOK_SECRET,
                        insecure_ssl: '0',
                    },
                },
                {
                    headers: {
                        Authorization: `token ${accessToken}`,
                        'User-Agent': 'GitHub-PR-Reviewer',
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        console.log('✅ Webhooks registered for all repositories');
    } catch (error) {
        console.error('❌ Webhook Registration Error:', error);
    }
};

exports.postPRComment = async (accessToken, owner, repo, prNumber, comment) => {
    try {
        await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
            { body: comment },
            {
                headers: {
                    Authorization: `token ${accessToken}`,
                    'User-Agent': 'GitHub-PR-Reviewer',
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`✅ Comment posted on PR #${prNumber} in ${owner}/${repo}`);
    } catch (error) {
        console.error('❌ Posting PR Comment Error:', error);
    }
};
