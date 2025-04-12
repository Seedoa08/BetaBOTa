const OpenAI = require('openai');
const fs = require('fs');
const config = require('../config/openai');

const openai = new OpenAI({
    apiKey: config.apiKey
});

async function generateWordlist() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: "Tu es un modérateur qui doit fournir une liste exhaustive de mots à filtrer pour un bot Discord. Format JSON uniquement."
            }, {
                role: "user",
                content: "Génère une liste complète de mots à filtrer en français et anglais pour la modération d'un serveur Discord. Format attendu : { \"french\": { \"insults\": [], \"discriminations\": [], \"threats\": [] }, \"english\": { \"insults\": [], \"discriminations\": [], \"threats\": [] } }"
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content;
        try {
            const wordlist = JSON.parse(content);
            fs.writeFileSync('./config/wordlist.json', JSON.stringify(wordlist, null, 2));
            return wordlist;
        } catch (parseError) {
            console.error('Erreur de parsing JSON:', content);
            throw new Error('Format de réponse invalide');
        }
    } catch (error) {
        console.error('Erreur lors de la génération de la wordlist:', error);
        throw error;
    }
}

module.exports = { generateWordlist };
