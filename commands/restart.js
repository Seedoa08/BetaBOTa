const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
    name: 'restart',
    description: 'Redémarre le bot en synchronisant les fichiers.',
    usage: '+restart',
    permissions: 'OwnerOnly',
    async execute(message) {
        const ownerId = '1061373376767201360';

        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        try {
            // Sauvegarde des informations de redémarrage
            const restartInfo = {
                channelId: message.channel.id,
                timestamp: Date.now()
            };
            fs.writeFileSync('./lastRestart.json', JSON.stringify(restartInfo, null, 4));

            await message.reply('🔄 Redémarrage du bot en cours... (Synchronisation des fichiers)');
            
            exec('pm2 restart bot', (error, stdout, stderr) => {
                if (error) {
                    console.error('Erreur lors du redémarrage:', error);
                    message.channel.send('❌ Une erreur est survenue lors du redémarrage.');
                }
            });
        } catch (error) {
            console.error('Erreur dans la commande restart:', error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande de redémarrage.');
        }
    }
};
