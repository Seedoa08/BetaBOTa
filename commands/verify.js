const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'verify',
    description: 'Configure le système de vérification',
    usage: '+verify setup [message]',
    permissions: 'Administrator',
    variables: [
        { name: 'setup', description: 'Configure le système de vérification' },
        { name: '[message]', description: 'Message personnalisé de vérification' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('❌ Vous n\'avez pas la permission de configurer le système de vérification.');
        }

        const subCommand = args[0]?.toLowerCase();
        if (subCommand !== 'setup') {
            return message.reply('❌ Commande invalide. Utilisez `+verify setup [message]`.');
        }

        const customMessage = args.slice(1).join(' ') || 'Cliquez sur le bouton ci-dessous pour vérifier votre compte.';

        const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('Vérifier')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(verifyButton);

        const verifyEmbed = {
            color: 0x00ff00,
            title: '🔒 Vérification',
            description: customMessage,
            footer: {
                text: `Configuré par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        try {
            await message.channel.send({ embeds: [verifyEmbed], components: [row] });
            message.reply('✅ Système de vérification configuré avec succès.');
        } catch (error) {
            console.error('Erreur lors de la configuration du système de vérification:', error);
            message.reply('❌ Une erreur est survenue lors de la configuration du système de vérification.');
        }
    }
};