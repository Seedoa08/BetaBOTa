const { PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'slowmode',
    description: 'Configure le mode lent du canal',
    usage: '+slowmode [durée/off] [raison]',
    permissions: 'ManageChannels',
    variables: [
        { name: '[durée]', description: 'Durée du mode lent (ex: 5s, 10m, 1h) ou "off"' },
        { name: '[raison]', description: 'Raison de l\'activation du mode lent' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les canaux.');
        }

        const duration = args[0]?.toLowerCase();
        if (!duration) {
            return message.reply('✨ Mode lent actuel: ' + (message.channel.rateLimitPerUser || 'désactivé'));
        }

        if (duration === 'off') {
            await message.channel.setRateLimitPerUser(0, 'Mode lent désactivé');
            return message.reply('✅ Mode lent désactivé.');
        }

        const seconds = Math.min(21600, ms(duration) / 1000);
        if (isNaN(seconds)) {
            return message.reply('❌ Durée invalide. Utilisez un format valide (ex: 5s, 10m, 1h).');
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
        
        try {
            await message.channel.setRateLimitPerUser(seconds, reason);
            const embed = {
                color: 0x0099ff,
                title: '⏰ Mode lent activé',
                description: `Les membres doivent maintenant attendre ${ms(seconds * 1000, { long: true })} entre chaque message.`,
                footer: { text: `Modérateur: ${message.author.tag}` }
            };
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de la configuration du mode lent:', error);
            message.reply('❌ Une erreur est survenue lors de la configuration du mode lent.');
        }
    }
};
