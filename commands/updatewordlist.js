// Supprimez ou commentez les lignes qui utilisent `wordlistGenerator.js`
// const { generateWordlist } = require('../utils/wordlistGenerator');
const fs = require('fs');
const wordlistFile = './wordlist.json';

module.exports = {
    name: 'updatewordlist',
    description: 'Génère une nouvelle wordlist à partir d\'un prompt.',
    usage: '+updatewordlist <prompt>',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        if (message.author.id !== '1061373376767201360') {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        const prompt = args.join(' ');
        if (!prompt) {
            return message.reply('❌ Vous devez fournir un prompt pour générer la wordlist.');
        }

        try {
            const wordlist = await generateWordlist(prompt);
            fs.writeFileSync(wordlistFile, JSON.stringify(wordlist, null, 4));
            message.reply('✅ La wordlist a été mise à jour avec succès.');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la wordlist:', error);
            message.reply('❌ Une erreur est survenue lors de la mise à jour de la wordlist.');
        }
    }
};
