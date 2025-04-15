const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const warningsFile = './warnings.json';

module.exports = {
    name: 'modstats',
    description: 'Affiche les statistiques de modération du serveur',
    usage: '+modstats [global/user @utilisateur]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les statistiques.');
        }

        const logs = JSON.parse(fs.readFileSync('./logs/moderation.json', 'utf8'));
        
        const stats = {
            total: logs.length,
            bans: logs.filter(log => log.action === 'ban').length,
            kicks: logs.filter(log => log.action === 'kick').length,
            mutes: logs.filter(log => log.action === 'mute').length,
            warns: logs.filter(log => log.action === 'warn').length
        };

        const embed = {
            color: 0x0099ff,
            title: '📊 Statistiques de modération',
            fields: [
                { name: 'Actions totales', value: `${stats.total}`, inline: true },
                { name: 'Bannissements', value: `${stats.bans}`, inline: true },
                { name: 'Expulsions', value: `${stats.kicks}`, inline: true },
                { name: 'Mutes', value: `${stats.mutes}`, inline: true },
                { name: 'Avertissements', value: `${stats.warns}`, inline: true }
            ],
            footer: { text: `Demandé par ${message.author.tag}` },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [embed] });
    }
};
