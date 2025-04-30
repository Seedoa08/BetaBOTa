const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
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
                commands: [
                    'ban', 'kick', 'mute', 'unmute', 'warn', 'clearwarns', 'clear',
                    'lock', 'unlock', 'timeout', 'unban', 'history', 'case',
                    'slowmode', 'purge', 'nuke'
                ]
            },
            "⚙️ Configuration": {
                color: 0x00ff00,
                description: "Paramètres et configuration du bot",
                commands: [
                    'raid', 'settings', 'automod', 'welcome', 'goodbye', 
                    'logs', 'autorole', 'setprefix', 'setlang', 'backup',
                    'antispam', 'antilink', 'blacklist'
                ]
            },
            "📊 Utilitaire": {
                color: 0x0099ff,
                description: "Outils et commandes pratiques",
                commands: [
                    'ping', 'serverinfo', 'userinfo', 'help', 'info', 'avatar',
                    'banner', 'roleinfo', 'channelinfo', 'uptime', 'botinfo',
                    'membercount', 'snipe', 'weather', 'status'
                ]
            },
            "🎫 Support": {
                color: 0xff9900,
                description: "Système de support et tickets",
                commands: [
                    'ticket', 'verify', 'report', 'suggest', 'bug', 'feedback',
                    'contact', 'support'
                ]
            },
            "⭐ Premium": {
                color: 0xf1c40f,
                description: "Commandes réservées aux serveurs premium",
                commands: [
                    'giveaway', 'reactionrole', 'customcommand', 'autoresponder',
                    'autoreact', 'customembed', 'premium'
                ]
            },
            "👑 Owner": {
                color: 0xe74c3c,
                description: "Commandes réservées aux propriétaires",
                commands: [
                    'eval', 'reload', 'maintenance', 'blacklist', 'leave',
                    'announce', 'setactivity', 'setstatus'
                ]
            }
        };

        // Filtrer les commandes selon les permissions
        const embeds = [];
        let totalCommands = 0;
        
        Object.entries(categories).forEach(([categoryName, category], index) => {
            const availableCommands = category.commands.filter(cmdName => {
                const cmd = message.client.commands.get(cmdName);
                if (!cmd) return false;
                if (isOwner(message.author.id)) return true;
                if (!cmd.permissions) return true;
                
                // Vérifier si la permission existe dans PermissionsBitField
                const permFlag = PermissionsBitField.Flags[cmd.permissions];
                return permFlag ? message.member.permissions.has(permFlag) : false;
            });

            if (availableCommands.length === 0) return;
            totalCommands += availableCommands.length;

            embeds.push({
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
                    text: `Page ${index + 1}/${Object.keys(categories).length} • ${availableCommands.length} commandes`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            });
        });

        let currentPage = 0;

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

        // Envoyer le premier embed avec les boutons
        if (embeds.length === 0) {
            return message.reply('❌ Aucune commande disponible.');
        }

        const helpMessage = await message.reply({
            embeds: [embeds[currentPage]],
            components: [row]
        });

        const collector = helpMessage.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async i => {
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

                const newEmbed = {...embeds[currentPage]};
                newEmbed.footer.text = `Page ${currentPage + 1}/${embeds.length} • ${embeds[currentPage].description.split('\n').length - 2} commandes`;

                await helpMessage.edit({
                    embeds: [newEmbed],
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
