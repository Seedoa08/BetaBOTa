const { ownerId } = require('../config/owner');

module.exports = {
    name: 'shutdown',
    description: 'Arrête le bot proprement (Owner only)',
    usage: '+shutdown',
    permissions: 'Owner',
    async execute(message) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        try {
            await message.reply('🔄 Arrêt du bot en cours...');
            console.log('Bot arrêté par l\'owner');
            process.exit(0);
        } catch (error) {
            console.error('Erreur lors de l\'arrêt:', error);
            message.reply('❌ Une erreur est survenue lors de l\'arrêt du bot.');
        }
    }
};
