const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
    name: 'restart',
    description: 'Redémarre le bot.',
    usage: '+restart',
    permissions: 'OwnerOnly',
    async execute(message) {
        const ownerId = '1061373376767201360'; // Remplacez par votre ID
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        try {
            await message.reply('🔄 Redémarrage en cours...');
            process.exit(0); // Quitte le processus pour permettre un redémarrage
        } catch (error) {
            console.error('Erreur lors du redémarrage:', error);
            message.reply('❌ Une erreur est survenue lors du redémarrage.');
        }
    }
};
