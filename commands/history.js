const fs = require('fs');
const warningsFile = './warnings.json';
const muteHistoryFile = './muteHistory.json';

module.exports = {
    name: 'history',
    description: 'Affiche l\'historique des actions modératrices sur un utilisateur.',
    usage: '+history @utilisateur',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Vous devez mentionner un utilisateur pour voir son historique.');
        }

        const warnings = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile, 'utf8')) : {};
        const mutes = fs.existsSync(muteHistoryFile) ? JSON.parse(fs.readFileSync(muteHistoryFile, 'utf8')) : {};

        const userWarnings = warnings[user.id] || [];
        const userMutes = mutes[user.id] || { count: 0 };

        const embed = {
            color: 0x0099ff,
            title: `📜 Historique de modération pour ${user.tag}`,
            fields: [
                { name: '⚠️ Avertissements', value: userWarnings.length > 0 ? userWarnings.map((w, i) => `**${i + 1}.** ${w.reason} - <t:${Math.floor(new Date(w.date).getTime() / 1000)}:F>`).join('\n') : 'Aucun avertissement.' },
                { name: '🔇 Mutes', value: `Total : ${userMutes.count}` }
            ],
            footer: {
                text: `Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [embed] });
    }
};
