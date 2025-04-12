const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Configure le mode lent du salon.',
    usage: '+slowmode <durée/off>',
    permissions: 'ManageChannels',
    variables: [
        { name: 'durée', description: 'Durée en secondes (5s à 6h) ou "off" pour désactiver' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les salons.');
        }

        const duration = args[0]?.toLowerCase();

        if (duration === 'off') {
            await message.channel.setRateLimitPerUser(0);
            return message.reply('✅ Mode lent désactivé.');
        }

        const seconds = parseInt(duration);
        if (isNaN(seconds) || seconds < 5 || seconds > 21600) {
            return message.reply('❌ La durée doit être entre 5 secondes et 6 heures.');
        }

        await message.channel.setRateLimitPerUser(seconds);
        message.reply(`✅ Mode lent configuré à ${seconds} secondes.`);
    }
};
