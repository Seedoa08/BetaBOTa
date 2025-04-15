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
        // Vérifiez si l'utilisateur a la permission de gérer les canaux
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de verrouiller les canaux.');
        }

        // Vérifiez si le bot a la permission de gérer les permissions du canal
        const channel = message.channel;
        if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Je n\'ai pas la permission de gérer les permissions de ce canal.');
        }

        // Vérifiez si le canal est déjà verrouillé
        const currentPermissions = channel.permissionsFor(message.guild.roles.everyone);
        if (!currentPermissions.has(PermissionsBitField.Flags.SendMessages)) {
            return message.reply('❌ Ce canal est déjà verrouillé.');
        }

        try {
            // Appliquez les permissions pour verrouiller le canal
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });

            // Message de confirmation
            const lockMessage = args.join(' ') || '🔒 Ce canal a été verrouillé.';
            const lockEmbed = {
                color: 0xff0000,
                title: '🔒 Canal verrouillé',
                description: lockMessage,
                footer: {
                    text: `Verrouillé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            await message.channel.send({ embeds: [lockEmbed] });
        } catch (error) {
            console.error('Erreur lors du verrouillage du canal:', error);
            message.reply('❌ Une erreur est survenue lors du verrouillage du canal.');
        }
    }
};
