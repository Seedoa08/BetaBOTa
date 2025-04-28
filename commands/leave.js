const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'leave',
    description: 'Fait quitter le bot du serveur',
    usage: '+leave',
    permissions: 'Administrator',
    async execute(message, args) {
        // Commande réservée aux owners uniquement
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        try {
            const confirmationMessage = await message.reply('⚠️ Êtes-vous sûr de vouloir me faire quitter ce serveur ? Répondez par `oui` ou `non`.');
            const filter = response => response.author.id === message.author.id && ['oui', 'non'].includes(response.content.toLowerCase());
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });

            if (!collected.size || collected.first().content.toLowerCase() === 'non') {
                return message.reply('❌ Action annulée.');
            }

            await message.reply('👋 Au revoir ! Je quitte ce serveur.');
            await message.guild.leave();
        } catch (error) {
            console.error('Erreur lors de la tentative de quitter le serveur:', error);
            message.reply('❌ Une erreur est survenue lors de la tentative de quitter le serveur.');
        }
    }
};
