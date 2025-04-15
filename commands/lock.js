const { PermissionsBitField } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    name: 'lock',
    description: 'Verrouille un canal pour empêcher les membres d\'envoyer des messages.',
    usage: '+lock [message]',
    permissions: 'ManageChannels',
    variables: [
        { name: '[message]', description: 'Message à afficher après le verrouillage (facultatif).' }
    ],
    async execute(message, args) {
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
            const lockMessage = args.join(' ') || '🔒 Ce canal a été verrouillé.';
            message.reply(`✅ Le canal a été verrouillé.\n${lockMessage}`);
        } catch (error) {
            console.error('Erreur lors du verrouillage du canal:', error);
            message.reply('❌ Une erreur est survenue lors du verrouillage du canal.');
        }
    }
};
