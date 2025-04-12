const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Déverrouille un canal pour permettre aux membres d\'envoyer des messages.',
    usage: '+unlock',
    permissions: 'ManageChannels',
    variables: [],
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de déverrouiller les canaux.');
        }

        const channel = message.channel;

        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Je n\'ai pas la permission de gérer les permissions de ce canal.');
        }

        const currentPermissions = channel.permissionsFor(channel.guild.roles.everyone);
        if (currentPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            return message.reply('❌ Ce canal est déjà déverrouillé.');
        }

        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: true });
            message.reply('✅ Le canal a été déverrouillé.');
        } catch (error) {
            console.error('Erreur lors du déverrouillage du canal:', error);
            message.reply('❌ Une erreur est survenue lors du déverrouillage du canal.');
        }
    }
};
