const axios = require('axios');

exports.generateReview = async (prData) => {
    const prompt = `
You are an automated code reviewer. Analyze the following Pull Request and provide a constructive review.

**Title:** ${prData.title}
**Description:** ${prData.body}

**Review:**
`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.5,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_MODEL_API_KEY}`,
                },
            }
        );

        const review = response.data.choices[0].text.trim();
        return review;
    } catch (error) {
        console.error('❌ AI Model Error:', error);
        return '⚠️ Unable to generate a review at this time.';
    }
};
