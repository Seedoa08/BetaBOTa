const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Crée un panel de tickets',
    usage: '+ticket panel',
    permissions: 'ManageChannels',
    async execute(message, args) {
        if (!message.guild.members.me.permissions.has('ManageChannels')) {
            return message.reply('❌ Je n\'ai pas la permission de gérer les salons.');
        }

        if (args[0]?.toLowerCase() !== 'panel') {
            return message.reply('❌ Usage: `+ticket panel`');
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎫 Système de Tickets')
            .setDescription('Cliquez sur le bouton correspondant à votre besoin :')
            .addFields(
                { name: '❓ Support', value: 'Pour toute demande d\'aide', inline: false },
                { name: '🚨 Signalement', value: 'Pour signaler un comportement inapproprié', inline: false },
                { name: '🤝 Partenariat', value: 'Pour proposer un partenariat', inline: false }
            )
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_support')
                .setLabel('Support')
                .setEmoji('❓')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_report')
                .setLabel('Signalement')
                .setEmoji('🚨')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_partner')
                .setLabel('Partenariat')
                .setEmoji('🤝')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};
