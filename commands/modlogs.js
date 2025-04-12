const { PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'modlogs',
    description: 'Affiche l\'historique des actions de modération.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les logs de modération.');
        }

        const logsFile = './logs/moderation.json';
        const userId = message.mentions.users.first()?.id;

        try {
            const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
            const filteredLogs = userId ? logs.filter(log => log.targetId === userId) : logs.slice(-10);

            const embed = {
                color: 0xff0000,
                title: '📋 Logs de modération',
                description: filteredLogs.map(log => 
                    `\`${new Date(log.timestamp).toLocaleString()}\` ${log.action} - ${log.description}`
                ).join('\n') || 'Aucun log trouvé.',
                footer: {
                    text: userId ? `Logs filtrés pour l'utilisateur` : 'Dernières actions'
                }
            };

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de la lecture des logs:', error);
            message.reply('❌ Une erreur est survenue.');
        }
    }
};
