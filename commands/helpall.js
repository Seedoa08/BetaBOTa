const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix } = require('../config/globals');
const { ownerId } = require('../config/owner');

module.exports = {
    name: 'helpall',
    description: 'Affiche une aide détaillée de toutes les commandes',
    usage: '+helpall [catégorie]',
    permissions: 'Aucune',
    async execute(message, args) {
        const categories = {
            "🛡️ Modération": [
                { name: "ban", extraInfo: "Options: --silent, --del [jours]" },
                { name: "kick", extraInfo: "Confirmation requise" },
                { name: "mute", extraInfo: "Système progressif, options: --notify, --silent" },
                { name: "warn", extraInfo: "Système d'avertissements progressifs" },
                { name: "clear", extraInfo: "Options: --bots, --users, --from @user" }
            ],
            "⚙️ Configuration": [
                { name: "anti-raid", extraInfo: "Protection avancée contre les raids" },
                { name: "raid-mode", extraInfo: "Options: --strict, --lockdown" },
                { name: "settings", extraInfo: "Configuration du bot" }
            ],
            "🔒 Owner Only": [
                { name: "eval", extraInfo: "Exécution de code JavaScript" },
                { name: "maintenance", extraInfo: "Mode maintenance" }
            ]
        };

        const embeds = Object.entries(categories)
            .filter(([category, commands]) => {
                if (category === "🔒 Owner Only" && message.author.id !== ownerId) {
                    return false;
                }
                return commands.length > 0;
            })
            .map(([category, commands]) => ({
                color: 0x0099ff,
                title: `📚 Guide Détaillé - ${category}`,
                description: 'Description détaillée des commandes :',
                fields: commands.map(cmd => {
                    const command = message.client.commands.get(cmd.name);
                    return {
                        name: `${prefix}${cmd.name}`,
                        value: [
                            `📝 Description: ${command?.description || 'Pas de description'}`,
                            `🔧 Usage: \`${command?.usage || prefix + cmd.name}\``,
                            `🛠️ Info: ${cmd.extraInfo}`,
                            `👮 Permissions: ${command?.permissions || 'Aucune'}`
                        ].join('\n')
                    };
                }),
                footer: {
                    text: `Page {current}/{total} • Guide complet`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                }
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

        try {
            const embed = embeds[currentPage];
            embed.footer.text = embed.footer.text
                .replace('{current}', currentPage + 1)
                .replace('{total}', embeds.length);

            const helpMessage = await message.channel.send({
                embeds: [embed],
                components: [getButtons(currentPage, embeds.length)]
            });

            const collector = helpMessage.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 300000
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
        } catch (error) {
            console.error('Erreur dans helpall:', error);
            message.reply('❌ Une erreur est survenue lors de l\'affichage de l\'aide.');
        }
    }
};
