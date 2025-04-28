const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'logs',
    description: 'Affiche les logs de modération',
    usage: '+logs [nombre]',
    permissions: 'ViewAuditLog',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les logs.');
        }

        // Création du salon de logs s'il n'existe pas
        let logsChannel = message.guild.channels.cache.find(channel => channel.name === '📜logs');
        if (!logsChannel) {
            try {
                logsChannel = await message.guild.channels.create({
                    name: '📜logs',
                    type: 0,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: message.guild.roles.cache.find(r => r.name === 'Admin')?.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: message.guild.roles.cache.find(r => r.name === 'Modérateur')?.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
            } catch (error) {
                console.error('Erreur lors de la création du salon logs:', error);
                return message.reply('❌ Impossible de créer le salon de logs.');
            }
        }

        const filter = args[0]?.toLowerCase() || 'all';
        const page = parseInt(args.find(arg => arg.startsWith('--page'))?.split(' ')[1]) || 1;
        const logsPerPage = 10;

        // Chargement des logs
        const logs = await this.loadLogs(filter);
        const totalPages = Math.ceil(logs.length / logsPerPage);
        const currentPageLogs = logs.slice((page - 1) * logsPerPage, page * logsPerPage);

        if (logs.length === 0) {
            return message.reply('❌ Aucun log trouvé pour ce filtre.');
        }

        const embed = {
            color: this.getColorForFilter(filter),
            title: `📜 Logs ${filter.toUpperCase()}`,
            description: this.formatLogs(currentPageLogs),
            footer: {
                text: `Page ${page}/${totalPages} • Total: ${logs.length} logs`,
                icon_url: message.guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        // Boutons de pagination
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages)
        );

        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        // Gestionnaire de pagination
        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: '❌ Vous ne pouvez pas utiliser ces boutons.', ephemeral: true });
            }

            const newPage = interaction.customId === 'prev' ? page - 1 : page + 1;
            const newLogs = logs.slice((newPage - 1) * logsPerPage, newPage * logsPerPage);

            embed.description = this.formatLogs(newLogs);
            embed.footer.text = `Page ${newPage}/${totalPages} • Total: ${logs.length} logs`;

            await interaction.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(console.error);
        });
    },

    getColorForFilter(filter) {
        const colors = {
            all: 0x0099ff,
            bans: 0xff0000,
            kicks: 0xff9900,
            messages: 0x00ff00,
            boosts: 0xff00ff,
            roles: 0x9900ff
        };
        return colors[filter] || colors.all;
    },

    async loadLogs(filter) {
        const logsPath = path.join(__dirname, '../logs/server_logs.json');
        if (!fs.existsSync(logsPath)) {
            return [];
        }

        const logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        return filter === 'all' ? logs : logs.filter(log => log.type === filter);
    },

    formatLogs(logs) {
        return logs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            switch (log.type) {
                case 'message_delete':
                    return `🗑️ \`${timestamp}\` Message supprimé par ${log.executor} dans ${log.channel}\nContenu: ${log.content || '*Non disponible*'}`;
                case 'ban':
                    return `🔨 \`${timestamp}\` ${log.user} banni par ${log.executor}\nRaison: ${log.reason || '*Non spécifiée*'}`;
                case 'kick':
                    return `👢 \`${timestamp}\` ${log.user} expulsé par ${log.executor}\nRaison: ${log.reason || '*Non spécifiée*'}`;
                case 'boost':
                    return `💎 \`${timestamp}\` ${log.user} a boosté le serveur! (Total: ${log.boostCount})`;
                case 'role_update':
                    return `👔 \`${timestamp}\` ${log.user} ${log.action} le rôle ${log.role}`;
                case 'nickname_update':
                    return `📝 \`${timestamp}\` ${log.user} a changé de pseudo: ${log.oldName} → ${log.newName}`;
                default:
                    return `📝 \`${timestamp}\` ${log.description}`;
            }
        }).join('\n\n');
    }
};
