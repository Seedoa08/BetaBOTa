const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Configure le mode lent sur un canal.',
    usage: '+slowmode [durée en secondes]',
    permissions: 'ManageChannels',
    variables: [
        { name: '[durée]', description: 'Durée du mode lent en secondes (0 pour désactiver).' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les canaux.');
        }

        const duration = parseInt(args[0], 10);
        if (isNaN(duration) || duration < 0 || duration > 21600) {
            return message.reply('❌ Veuillez spécifier une durée valide entre 0 et 21600 secondes.');
        }

        try {
            await message.channel.setRateLimitPerUser(duration);
            message.reply(`✅ Le mode lent a été configuré sur ${duration} seconde(s).`);
        } catch (error) {
            console.error('Erreur lors de la configuration du mode lent:', error);
            message.reply('❌ Une erreur est survenue lors de la configuration du mode lent.');
        }
    }
};
