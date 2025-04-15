const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const logsFile = './logs/moderation.json';

module.exports = {
    name: 'modstats',
    description: 'Affiche les statistiques des actions de modération.',
    usage: '+modstats',
    permissions: 'ManageMessages',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les statistiques des modérateurs.');
        }

        const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
        const stats = {};

        logs.forEach(log => {
            if (log.moderator) {
                if (!stats[log.moderator.id]) {
                    stats[log.moderator.id] = { bans: 0, mutes: 0, warns: 0, kicks: 0 };
                }
                stats[log.moderator.id][log.action] = (stats[log.moderator.id][log.action] || 0) + 1;
            }
        });

        const statsList = Object.entries(stats)
            .map(([modId, actions]) => {
                const mod = message.guild.members.cache.get(modId);
                return `**${mod?.user.tag || 'Inconnu'}**\nBans: ${actions.bans || 0}, Mutes: ${actions.mutes || 0}, Warns: ${actions.warns || 0}, Kicks: ${actions.kicks || 0}`;
            })
            .join('\n') || 'Aucune action modératrice enregistrée.';

        const embed = {
            color: 0x0099ff,
            title: '📊 Statistiques des modérateurs',
            description: statsList,
            footer: {
                text: `Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [embed] });
    }
};
