const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'modlogs',
    description: 'Affiche les logs de modération',
    usage: '+modlogs [user/all] [nombre]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        const logs = JSON.parse(fs.readFileSync('./logs/moderation.json', 'utf8'));
        const user = message.mentions.users.first();
        const amount = parseInt(args[1]) || 10;

        let filteredLogs = logs;
        if (user) {
            filteredLogs = logs.filter(log => log.user.id === user.id);
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📋 Logs de modération')
            .setDescription(
                filteredLogs.slice(-amount).map(log => 
                    `**${log.action}** - ${log.user.tag}\n📅 ${new Date(log.date).toLocaleString()}\n📝 ${log.reason || 'Pas de raison'}`
                ).join('\n\n')
            );

        message.reply({ embeds: [embed] });
    }
};
