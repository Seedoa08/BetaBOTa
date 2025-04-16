const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Gère le système de tickets',
    usage: '+ticket <create/close/setup>',
    permissions: 'ManageChannels',
    variables: [
        { name: 'create', description: 'Crée un nouveau ticket' },
        { name: 'close', description: 'Ferme le ticket actuel' },
        { name: 'setup', description: 'Configure le système de tickets' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les tickets.');
        }

        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'setup':
                const setupEmbed = {
                    color: 0x0099ff,
                    title: '🎫 Système de Tickets',
                    description: 'Cliquez sur le bouton ci-dessous pour créer un ticket'
                };

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel('Créer un ticket')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('🎫')
                    );

                await message.channel.send({ embeds: [setupEmbed], components: [row] });
                break;

            case 'close':
                if (!message.channel.name.startsWith('ticket-')) {
                    return message.reply('❌ Cette commande ne peut être utilisée que dans un canal de ticket.');
                }

                const closeEmbed = {
                    color: 0xff0000,
                    title: '🔒 Fermeture du ticket',
                    description: 'Le ticket va être fermé dans 5 secondes...'
                };

                await message.reply({ embeds: [closeEmbed] });
                setTimeout(() => message.channel.delete(), 5000);
                break;

            default:
                return message.reply('❌ Usage: `+ticket <create/close/setup>`');
        }
    }
};
