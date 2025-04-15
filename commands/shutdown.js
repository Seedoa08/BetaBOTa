const { ownerId } = require('../config/owner');

module.exports = {
    name: 'shutdown',
    description: 'Arrête proprement le bot',
    usage: '+shutdown',
    permissions: 'OwnerOnly',
    async execute(message) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée au propriétaire du bot.');
        }

        await message.reply('💤 Arrêt du bot en cours...');
        process.exit(0);
    }
};
