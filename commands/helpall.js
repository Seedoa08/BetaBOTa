const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix } = require('../config/globals');

module.exports = {
    name: 'helpall',
    description: 'Affiche une aide détaillée de toutes les commandes.',
    usage: '+helpall',
    permissions: 'Aucune',
    async execute(message) {
        const categories = {
            "🛡️ Modération": [
                'ban', 'kick', 'mute', 'unmute', 'warn', 'clear', 'lock', 'unlock', 'slowmode', 'purge', 'nuke'
            ],
            "⚙️ Configuration": [
                'anti-raid', 'settings', 'maintenance', 'automod'
            ],
            "📊 Utilitaires": [
                'ping', 'info', 'serverinfo', 'userinfo', 'pic', 'banner', 'snipe'
            ],
            "🛠️ Système": [
                'help', 'helpall', 'warnings'
            ],
            "🔒 Administration": [
                'eval', 'maintenance', 'owneronly'
            ]
        };

        const embeds = Object.entries(categories).map(([category, commands]) => ({
            color: 0x0099ff,
            title: `📚 Commandes - ${category}`,
            description: 'Voici une liste détaillée des commandes disponibles :',
            fields: commands.map(cmdName => {
                const command = message.client.commands.get(cmdName);
                return {
                    name: `\`${prefix}${cmdName}\``,
                    value: command?.description || 'Pas de description disponible.'
                };
            }),
            footer: {
                text: `Page {current}/{total} • ${message.client.commands.size} commandes disponibles`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        }));

        let currentPage = 0;

        const getButtons = (current, total) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current === 0),
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current === total - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current === total - 1)
            );
        };

        const embed = embeds[currentPage];
        embed.footer.text = embed.footer.text
            .replace('{current}', currentPage + 1)
            .replace('{total}', embeds.length);

        const helpMessage = await message.reply({
            embeds: [embed],
            components: [getButtons(currentPage, embeds.length)]
        });

        const collector = helpMessage.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async interaction => {
            switch (interaction.customId) {
                case 'first':
                    currentPage = 0;
                    break;
                case 'previous':
                    currentPage = Math.max(0, currentPage - 1);
                    break;
                case 'next':
                    currentPage = Math.min(embeds.length - 1, currentPage + 1);
                    break;
                case 'last':
                    currentPage = embeds.length - 1;
                    break;
            }

            const newEmbed = embeds[currentPage];
            newEmbed.footer.text = newEmbed.footer.text
                .replace('{current}', currentPage + 1)
                .replace('{total}', embeds.length);

            await interaction.update({
                embeds: [newEmbed],
                components: [getButtons(currentPage, embeds.length)]
            });
        });

        collector.on('end', () => {
            helpMessage.edit({ components: [] }).catch(() => {});
        });
    }
};
