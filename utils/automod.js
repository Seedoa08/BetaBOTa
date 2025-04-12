const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function analyze(message) {
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Analyse this message for inappropriate content: "${message.content}"`,
            max_tokens: 50,
            temperature: 0.5
        });

        const result = response.data.choices[0].text.trim();
        return result.includes('flagged') ? { flagged: true, reason: result } : { flagged: false };
    } catch (error) {
        console.error('Erreur lors de l\'analyse du message:', error);
        return { flagged: false };
    }
}

module.exports = { analyze };
