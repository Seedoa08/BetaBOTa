const { generateWordlist } = require('../utils/wordlistGenerator');

module.exports = {
    name: 'updatewordlist',
    description: 'Met à jour la liste des mots filtrés via l\'API OpenAI',
    usage: '+updatewordlist',
    permissions: 'Administrator',
    async execute(message) {
        if (message.author.id !== '1061373376767201360') {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        const loadingMsg = await message.reply('🔄 Génération de la nouvelle liste de mots...');
        
        try {
            const wordlist = await generateWordlist();
            if (!wordlist) {
                return loadingMsg.edit('❌ Erreur lors de la génération de la liste.');
            }

            const stats = {
                french: Object.values(wordlist.french || {}).flat().length,
                english: Object.values(wordlist.english || {}).flat().length,
                total: Object.values(wordlist).flat().flat().length
            };

            const embed = {
                color: 0x00ff00,
                title: '✅ Liste de mots mise à jour',
                description: 'La liste de filtrage a été mise à jour avec succès.',
                fields: [
                    { name: 'Mots français', value: `${stats.french} mots`, inline: true },
                    { name: 'Mots anglais', value: `${stats.english} mots`, inline: true },
                    { name: 'Total', value: `${stats.total} mots`, inline: true }
                ],
                timestamp: new Date()
            };

            loadingMsg.edit({ content: null, embeds: [embed] });
        } catch (error) {
            console.error('Erreur:', error);
            loadingMsg.edit('❌ Une erreur est survenue lors de la mise à jour.');
        }
    }
};
