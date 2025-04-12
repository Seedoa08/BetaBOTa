const { PermissionsBitField } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    name: 'lock',
    description: 'Verrouille un canal pour empêcher les membres d\'envoyer des messages.',
    usage: '+lock',
    permissions: 'ManageChannels',
    variables: [],
    async execute(message) {
        // Vérification des permissions avec le nouveau système
        const hasPermission = checkPermissions(message, 'ManageChannels');
        if (!hasPermission) {
            return message.reply('❌ Vous n\'avez pas la permission de verrouiller les canaux.');
        }

        const channel = message.channel;

        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Je n\'ai pas la permission de gérer les permissions de ce canal.');
        }

        const currentPermissions = channel.permissionsFor(channel.guild.roles.everyone);
        if (!currentPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            return message.reply('❌ Ce canal est déjà verrouillé.');
        }

        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
            message.reply('✅ Le canal a été verrouillé.');
        } catch (error) {
            console.error('Erreur lors du verrouillage du canal:', error);
            message.reply('❌ Une erreur est survenue lors du verrouillage du canal.');
        }
    }
};
