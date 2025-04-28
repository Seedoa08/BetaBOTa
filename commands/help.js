const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix } = require('../config.json');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'help',
    description: 'Affiche l\'aide des commandes',
    permissions: null,

    async execute(message, args) {
        // Catégories et commandes associées
        const categories = {
            "🛡️ Modération": [
                'ban', 'kick', 'mute', 'unmute', 'warn', 'clear', 'tempmute', 'softban', 'lock', 'unlock'
            ],
            "⚙️ Configuration": [
                'anti-raid', 'settings', 'automod', 'setprefix', 'welcome', 'modlog', 'raid-mode'
            ],
            "📊 Utilitaire": [
                'ping', 'serverinfo', 'userinfo', 'help', 'info', 'avatar', 'version', 'changelog'
            ],
            "🔒 Administration": [
                'eval', 'maintenance', 'owneronly', 'reload', 'shutdown'
            ]
        };

        // Filtrer les commandes selon les permissions de l'utilisateur
        const availableCommands = {};
        Object.entries(categories).forEach(([category, cmdList]) => {
            availableCommands[category] = cmdList.filter(cmdName => {
                const cmd = message.client.commands.get(cmdName);
                if (!cmd) return false;
                if (isOwner(message.author.id)) return true;
                if (!cmd.permissions) return true;
                return message.member.permissions.has(cmd.permissions);
            });
        });

        // Créer des embeds pour chaque catégorie
        const embeds = Object.entries(availableCommands).map(([category, commands]) => ({
            color: 0x0099ff,
            title: `📜 Commandes - ${category}`,
            description: `Utilisez \`${prefix}help <commande>\` pour plus d'informations sur une commande spécifique.`,
            fields: commands.map(cmd => {
                const command = message.client.commands.get(cmd);
                return {
                    name: `\`${prefix}${cmd}\``,
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

        // Envoyer le premier embed avec les boutons
        const embed = embeds[currentPage];
        embed.footer.text = embed.footer.text
            .replace('{current}', currentPage + 1)
            .replace('{total}', embeds.length);

        const helpMessage = await message.reply({
            embeds: [embed],
            components: [getButtons(currentPage, embeds.length)]
        });

        // Créer le collecteur de boutons
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
            helpMessage.edit({ components: [] }).catch(() => { });
        });
    }
};
