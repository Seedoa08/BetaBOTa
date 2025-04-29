const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles',
    usage: '+help [commande]',
    category: 'Public',
    permissions: null,
    async execute(message, args) {
        const prefix = global.botConfig.prefix;
        
        // Si un argument est fourni, montrer l'aide détaillée pour cette commande
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName);
            
            if (!command) {
                return message.reply('❌ Cette commande n\'existe pas.');
            }

            const commandEmbed = {
                color: 0x0099ff,
                title: `Aide: ${prefix}${command.name}`,
                description: command.description || 'Aucune description disponible.',
                fields: [
                    { name: 'Usage', value: command.usage || `${prefix}${command.name}` },
                    { name: 'Permissions', value: command.permissions || 'Aucune permission requise' }
                ]
            };

            if (command.variables && command.variables.length > 0) {
                commandEmbed.fields.push({
                    name: 'Variables',
                    value: command.variables.map(v => `\`${v.name}\`: ${v.description}`).join('\n')
                });
            }

            return message.reply({ embeds: [commandEmbed] });
        }

        // Sinon, afficher la liste des commandes par catégorie
        const categories = {
            "🛡️ Modération": {
                color: 0xff0000,
                description: "Commandes de gestion et de modération du serveur",
                commands: ['ban', 'kick', 'mute', 'unmute', 'warn', 'clear']
            },
            "⚙️ Configuration": {
                color: 0x00ff00,
                description: "Paramètres et configuration du bot",
                commands: ['anti-raid', 'settings', 'automod', 'welcome']
            },
            "📊 Utilitaire": {
                color: 0x0099ff,
                description: "Outils et commandes pratiques",
                commands: ['ping', 'serverinfo', 'userinfo', 'help', 'info']
            },
            "🎫 Support": {
                color: 0xff9900,
                description: "Système de support et tickets",
                commands: ['ticket', 'verify']
            }
        };

        // Filtrer les commandes selon les permissions
        const embeds = Object.entries(categories).map(([categoryName, category]) => {
            const availableCommands = category.commands.filter(cmdName => {
                const cmd = message.client.commands.get(cmdName);
                if (!cmd) return false;
                if (isOwner(message.author.id)) return true;
                if (!cmd.permissions) return true;
                return message.member.permissions.has(cmd.permissions);
            });

            if (availableCommands.length === 0) return null;

            return {
                color: category.color,
                author: {
                    name: categoryName,
                    icon_url: message.guild.iconURL({ dynamic: true })
                },
                description: [
                    `${category.description}\n`,
                    availableCommands.map(cmdName => {
                        const cmd = message.client.commands.get(cmdName);
                        return `\`${prefix}${cmdName}\` ➜ ${cmd?.description || 'Pas de description'}`;
                    }).join('\n')
                ].join('\n'),
                footer: {
                    text: `Page {current}/{total} • ${message.client.commands.size} commandes`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };
        }).filter(embed => embed !== null);

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
        if (embeds.length === 0) {
            return message.reply('❌ Aucune commande disponible.');
        }

        const embed = embeds[currentPage];
        embed.footer.text = embed.footer.text
            .replace('{current}', currentPage + 1)
            .replace('{total}', embeds.length);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_first')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('help_prev')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('help_next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === embeds.length - 1),
                new ButtonBuilder()
                    .setCustomId('help_last')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === embeds.length - 1)
            );

        const helpMessage = await message.reply({
            embeds: [embeds[currentPage]],
            components: [row]
        });

        const collector = helpMessage.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id && i.message.id === helpMessage.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ 
                    content: '❌ Ces boutons ne sont pas pour vous!', 
                    flags: 1 << 6 // Correction ici
                });
            }

            try {
                await i.deferUpdate();
                
                switch (i.customId) {
                    case 'help_first': currentPage = 0; break;
                    case 'help_prev': currentPage = Math.max(0, currentPage - 1); break;
                    case 'help_next': currentPage = Math.min(embeds.length - 1, currentPage + 1); break;
                    case 'help_last': currentPage = embeds.length - 1; break;
                }

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('help_first')
                            .setLabel('⏪')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('help_prev')
                            .setLabel('◀️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('help_next')
                            .setLabel('▶️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === embeds.length - 1),
                        new ButtonBuilder()
                            .setCustomId('help_last')
                            .setLabel('⏩')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === embeds.length - 1)
                    );

                await helpMessage.edit({
                    embeds: [embeds[currentPage]],
                    components: [newRow]
                });
            } catch (error) {
                console.error('Erreur interaction help:', error);
            }
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help_first')
                        .setLabel('⏪')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('help_prev')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('help_next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('help_last')
                        .setLabel('⏩')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            helpMessage.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
