const { PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'mutelist',
    description: 'Affiche l\'historique des mutes d\'un utilisateur',
    usage: '+mutelist @utilisateur',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir l\'historique des mutes.');
        }

        const user = message.mentions.users.first();
        if (!user) return message.reply('❌ Veuillez mentionner un utilisateur.');

        const muteHistory = JSON.parse(fs.readFileSync('./muteHistory.json', 'utf8'));
        const userHistory = muteHistory[user.id] || { count: 0, lastMute: null };

        const embed = {
            color: 0xff9900,
            title: `📋 Historique des mutes - ${user.tag}`,
            fields: [
                { name: 'Nombre total de mutes', value: `${userHistory.count}`, inline: true },
                { name: 'Dernier mute', value: userHistory.lastMute ? `<t:${Math.floor(userHistory.lastMute/1000)}:R>` : 'Jamais', inline: true }
            ],
            footer: { text: `ID: ${user.id}` },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [embed] });
    }
};
