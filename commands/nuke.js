const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    description: 'Supprime tous les messages d\'un canal en le recréant.',
    usage: '+nuke',
    permissions: 'ManageChannels',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les canaux.');
        }

        const channel = message.channel;

        try {
            const newChannel = await channel.clone();
            await channel.delete();
            await newChannel.send('💣 Ce canal a été recréé avec succès.');
        } catch (error) {
            console.error('Erreur lors du nuke:', error);
            message.reply('❌ Une erreur est survenue lors du nuke.');
        }
    }
};
