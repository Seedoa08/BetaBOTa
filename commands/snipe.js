const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'snipe',
    description: 'Affiche les derniers messages supprimés dans le salon.',
    usage: '+snipe [nombre]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les messages supprimés.');
        }

        const snipes = Array.from(message.client.snipes.entries())
            .filter(([channelId]) => channelId === message.channel.id)
            .map(([, snipe]) => snipe);

        if (!snipes.length) {
            return message.reply('❌ Aucun message supprimé à afficher.');
        }

        let currentPage = 0;

        const generateEmbed = (page) => ({
            color: 0x0099ff,
            author: {
                name: snipes[page].author.tag,
                icon_url: snipes[page].author.displayAvatarURL({ dynamic: true })
            },
            description: snipes[page].content || 'Aucun contenu',
            image: snipes[page].image ? { url: snipes[page].image } : null,
            footer: { text: `Message ${page + 1}/${snipes.length} • ${snipes[page].date}` }
        });

        const getButtons = (page) => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === snipes.length - 1),
            new ButtonBuilder()
                .setCustomId('delete')
                .setLabel('🗑️')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await message.reply({
            embeds: [generateEmbed(0)],
            components: [getButtons(0)]
        });

        // ...existing code...
    }
};
