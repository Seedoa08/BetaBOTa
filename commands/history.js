const { PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'history',
    description: 'Affiche l\'historique complet des sanctions d\'un utilisateur',
    usage: '+history @utilisateur',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Permission manquante: Modérer les membres');
        }

        const user = message.mentions.users.first();
        if (!user) return message.reply('❌ Mentionnez un utilisateur');

        // Charger les différents historiques
        const sanctions = {
            bans: JSON.parse(fs.readFileSync('./logs/moderation.json', 'utf8')).filter(log => 
                log.action === 'ban' && log.user.id === user.id
            ),
            mutes: JSON.parse(fs.readFileSync('./logs/moderation.json', 'utf8')).filter(log => 
                log.action === 'mute' && log.user.id === user.id
            ),
            warns: JSON.parse(fs.readFileSync('./warnings.json', 'utf8'))[user.id] || []
        };

        const embed = {
            color: 0xff0000,
            title: `📋 Historique des sanctions de ${user.tag}`,
            thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
            fields: [
                {
                    name: '🔨 Bannissements',
                    value: sanctions.bans.map(ban => 
                        `\`${new Date(ban.date).toLocaleDateString()}\` ${ban.reason}`
                    ).join('\n') || 'Aucun bannissement'
                },
                {
                    name: '🔇 Mutes',
                    value: sanctions.mutes.map(mute =>
                        `\`${new Date(mute.date).toLocaleDateString()}\` ${mute.duration} - ${mute.reason}`
                    ).join('\n') || 'Aucun mute'
                },
                {
                    name: '⚠️ Avertissements',
                    value: sanctions.warns.map(warn =>
                        `\`${new Date(warn.date).toLocaleDateString()}\` ${warn.reason}`
                    ).join('\n') || 'Aucun avertissement'
                }
            ],
            footer: {
                text: `Total: ${sanctions.bans.length + sanctions.mutes.length + sanctions.warns.length} sanctions`
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
};
