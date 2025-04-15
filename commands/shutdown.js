module.exports = {
    name: 'shutdown',
    description: 'Arrête le bot.',
    usage: '+shutdown',
    permissions: 'OwnerOnly',
    async execute(message) {
        const ownerId = '1061373376767201360'; // Remplacez par votre ID

        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        try {
            console.time('Shutdown'); // Démarrer le chronomètre
            await message.reply('🛑 Arrêt du bot en cours...');
            console.log('Le bot est en train de s\'arrêter...');
            
            // Arrête proprement le bot
            process.exit(0);
            console.timeEnd('Shutdown'); // Arrêter le chronomètre
        } catch (error) {
            console.error('Erreur lors de l\'arrêt du bot :', error);
            message.reply('❌ Une erreur est survenue lors de l\'arrêt du bot.');
        }
    }
};
