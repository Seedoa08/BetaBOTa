const { prefix } = require('../config/globals');
const { ownerId } = require('../config/owner');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes par catégorie',
    usage: '+help [catégorie]',
    permissions: 'Aucune',
    async execute(message, args) {
        const categories = {
            "🛡️ Modération": [
                "ban", "kick", "mute", "tempmute", "unmute",
                "warn", "warnings", "clear", "lock", "unlock",
                "nuke", "slowmode"
            ],
            "⚙️ Configuration": [
                "serverinfo", "userinfo", "role", "anti-raid",
                "raid-mode"
            ],
            "🔒 Owner Only": [
                "eval", "owneronly", "maintenance", "debug",
                "restart"
            ],
            "📊 Utilitaires": [
                "ping", "help", "info", "snipe"
            ],
            "🛠️ Protection": [
                "raid-mode", "anti-raid", "lockdown"
            ]
        };

        const searchQuery = args[0]?.toLowerCase();
        if (searchQuery) {
            const command = message.client.commands.get(searchQuery) || message.client.commands.find(cmd => cmd.aliases?.includes(searchQuery));
            if (!command) {
                return message.reply(`❌ La commande \`${searchQuery}\` n'existe pas.`);
            }

            const commandEmbed = {
                color: 0x0099ff,
                title: `📖 Détails de la commande \`${command.name}\``,
                fields: [
                    { name: 'Description', value: command.description || 'Aucune description disponible.' },
                    { name: 'Usage', value: command.usage || 'Non spécifié.' },
                    { name: 'Permissions nécessaires', value: command.permissions || 'Aucune' },
                    { name: 'Alias', value: command.aliases?.join(', ') || 'Aucun' }
                ],
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            return message.channel.send({ embeds: [commandEmbed] });
        }

        const embeds = Object.entries(categories)
            .filter(([category, commands]) => {
                if (category === "🔒 Owner Only" && message.author.id !== ownerId) {
                    return false;
                }
                return commands.length > 0;
            })
            .map(([category, commands]) => ({
                color: 0x0099ff,
                title: `📜 Aide du bot - ${category}`,
                description: 'Voici la liste des commandes disponibles :',
                fields: commands.map(cmdName => {
                    const cmd = message.client.commands.get(cmdName);
                    return {
                        name: `\`${prefix}${cmdName}\``,
                        value: cmd?.description || 'Pas de description disponible'
                    };
                }),
                footer: {
                    text: `Page {current}/{total} • Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            }));

        let currentPage = 0;

        const getButtons = (currentPage, totalPages) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1)
            );
        };

        try {
            const embed = embeds[currentPage];
            embed.footer.text = embed.footer.text.replace('{current}', currentPage + 1).replace('{total}', embeds.length);
            
            const helpMessage = await message.channel.send({
                embeds: [embed],
                components: [getButtons(currentPage, embeds.length)]
            });

            const collector = helpMessage.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 300000 // 5 minutes
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
            console.error('Erreur lors de l\'envoi des embeds d\'aide:', error);
            message.reply('❌ Une erreur est survenue lors de l\'envoi des informations d\'aide.');
        }
    }
};
