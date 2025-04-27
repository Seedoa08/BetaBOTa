const { prefix } = require('../config/globals');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles.',
    usage: '+help [catégorie]',
    permissions: 'Aucune',
    async execute(message, args) {
        const categories = {
            "🛡️ Modération": ['ban', 'kick', 'mute', 'warn', 'clear'],
            "⚙️ Configuration": ['anti-raid', 'settings'],
            "📊 Utilitaires": ['ping', 'info', 'serverinfo', 'userinfo']
        };

        const embeds = Object.entries(categories).map(([category, commands]) => ({
            color: 0x0099ff,
            title: `📜 Commandes - ${category}`,
            description: `Utilisez \`${prefix}<commande>\` pour exécuter une commande.`,
            fields: commands.map(cmd => {
                const command = message.client.commands.get(cmd);
                return {
                    name: `\`${prefix}${cmd}\``,
                    value: command?.description || 'Pas de description disponible.'
                };
            }),
            footer: { text: `Demandé par ${message.author.tag}` },
            timestamp: new Date()
        }));

        let currentPage = 0;

        const getButtons = (current, total) => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(current === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(current === total - 1)
        );

        const helpMessage = await message.reply({
            embeds: [embeds[currentPage]],
            components: [getButtons(currentPage, embeds.length)]
        });

        const collector = helpMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'previous') currentPage--;
            if (interaction.customId === 'next') currentPage++;

            await interaction.update({
                embeds: [embeds[currentPage]],
                components: [getButtons(currentPage, embeds.length)]
            });
        });

        collector.on('end', () => helpMessage.edit({ components: [] }));
    }
};
