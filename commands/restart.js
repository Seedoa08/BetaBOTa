const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'restart',
    description: 'Redémarre le bot',
    usage: '+restart',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        // Commande réservée aux owners uniquement
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        try {
            await message.reply('🔄 Redémarrage en cours...');
            
            // Enregistrer le canal pour envoyer un message après redémarrage
            const restartInfo = { channelId: message.channel.id };
            require('fs').writeFileSync('./lastRestart.json', JSON.stringify(restartInfo, null, 4));

            // Quitter le processus pour permettre un redémarrage
            process.exit(0);
        } catch (error) {
            console.error('Erreur lors du redémarrage :', error);
            message.reply('❌ Une erreur est survenue lors du redémarrage.');
        }
    }
};
