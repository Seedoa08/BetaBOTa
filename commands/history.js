const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const warningsFile = './warnings.json';
const muteHistoryFile = './muteHistory.json';

module.exports = {
    name: 'history',
    description: 'Affiche l\'historique complet des sanctions d\'un utilisateur',
    usage: '+history @utilisateur',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir l\'historique des sanctions.');
        }

        const user = message.mentions.users.first();
        if (!user) return message.reply('❌ Veuillez mentionner un utilisateur.');

        const warnings = JSON.parse(fs.readFileSync('./warnings.json', 'utf8'));
        const muteHistory = JSON.parse(fs.readFileSync('./muteHistory.json', 'utf8'));
        const modLogs = JSON.parse(fs.readFileSync('./logs/moderation.json', 'utf8'));

        const userWarnings = warnings[user.id] || [];
        const userMutes = muteHistory[user.id] || { count: 0 };
        const userLogs = modLogs.filter(log => log.user.id === user.id);

        const embed = {
            color: 0xff0000,
            title: `📜 Historique des sanctions - ${user.tag}`,
            fields: [
                { 
                    name: '⚠️ Avertissements',
                    value: userWarnings.length ? userWarnings.map((w, i) => 
                        `${i+1}. ${w.reason} (<t:${Math.floor(new Date(w.date).getTime()/1000)}:R>)`
                    ).join('\n') : 'Aucun avertissement'
                },
                {
                    name: '🔇 Mutes',
                    value: `Total: ${userMutes.count}\nDernier mute: ${userMutes.lastMute ? `<t:${Math.floor(userMutes.lastMute/1000)}:R>` : 'Jamais'}`
                },
                {
                    name: '📋 Dernières actions',
                    value: userLogs.length ? userLogs.slice(-5).map(log => 
                        `• ${log.action.toUpperCase()} - ${log.reason} (<t:${Math.floor(new Date(log.date).getTime()/1000)}:R>)`
                    ).join('\n') : 'Aucune action'
                }
            ],
            footer: { text: `ID: ${user.id}` },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [embed] });
    }
};
