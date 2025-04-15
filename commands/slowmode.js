const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Configure le mode lent dans un salon',
    usage: '+slowmode <durée> [raison]',
    permissions: 'ManageChannels',
    variables: [
        { name: 'durée', description: 'Durée en secondes (0 pour désactiver)' },
        { name: 'raison', description: 'Raison du slowmode (facultatif)' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les canaux.');
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            return message.reply('❌ La durée doit être entre 0 et 21600 secondes (6 heures).');
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';
        
        try {
            await message.channel.setRateLimitPerUser(seconds, reason);
            const embed = {
                color: seconds === 0 ? 0x00ff00 : 0xff9900,
                title: seconds === 0 ? '🚫 Slowmode désactivé' : '⏱️ Slowmode activé',
                description: seconds === 0 ? 
                    'Le mode lent a été désactivé.' : 
                    `Mode lent configuré sur ${seconds} secondes.`,
                fields: [
                    { name: 'Salon', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Raison', value: reason }
                ]
            };
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de la configuration du mode lent:', error);
            message.reply('❌ Une erreur est survenue lors de la configuration du mode lent.');
        }
    }
};
