const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'shutdown',
    description: 'Éteint le bot proprement',
    usage: '+shutdown',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        // Cette commande est réservée uniquement aux owners
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        await message.reply('💤 Arrêt du bot en cours...');
        process.exit(0);
    }
};
