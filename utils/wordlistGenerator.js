const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function generateWordlist(prompt) {
    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 100,
            temperature: 0.7
        });

        return response.data.choices[0].text.trim().split('\n');
    } catch (error) {
        console.error('Erreur lors de la génération de la wordlist:', error);
        throw new Error('Impossible de générer la wordlist.');
    }
}

module.exports = { generateWordlist };
