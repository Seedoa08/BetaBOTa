const fs = require('fs');
const logsFile = './logs/moderation.json';

module.exports = {
    name: 'logs',
    description: 'Affiche les logs d\'actions de modération et d\'événements vocaux.',
    usage: '+logs [action] [@utilisateur]',
    permissions: 'ManageMessages',
    variables: [
        { name: '[action]', description: 'Filtrer par action (ban, mute, kick, messageDelete, voiceJoin, voiceLeave).' },
        { name: '[@utilisateur]', description: 'Filtrer par utilisateur mentionné.' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les logs.');
        }

        // Vérifiez si le fichier de logs existe
        if (!fs.existsSync(logsFile)) {
            return message.reply('❌ Aucun log n\'a été trouvé.');
        }

        try {
            const logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
            if (!Array.isArray(logs) || logs.length === 0) {
                return message.reply('❌ Aucun log n\'a été trouvé.');
            }

            // Filtrage par action
            const actionFilter = args[0]?.toLowerCase();
            const userFilter = message.mentions.users.first();

            let filteredLogs = logs;

            if (actionFilter) {
                filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
                if (filteredLogs.length === 0) {
                    return message.reply(`❌ Aucun log trouvé pour l'action \`${actionFilter}\`.`);
                }
            }

            if (userFilter) {
                filteredLogs = filteredLogs.filter(log => log.user?.id === userFilter.id || log.moderator?.id === userFilter.id);
                if (filteredLogs.length === 0) {
                    return message.reply(`❌ Aucun log trouvé pour l'utilisateur ${userFilter.tag}.`);
                }
            }

            // Limitez les logs affichés à 10 pour éviter les spams
            const logsToShow = filteredLogs.slice(0, 10).map((log, index) => {
                const logDetails = [
                    `**Action:** \`${log.action}\``,
                    `**Utilisateur:** ${log.user ? `${log.user.tag} (${log.user.id})` : 'N/A'}`,
                    `**Modérateur:** ${log.moderator ? `${log.moderator.tag} (${log.moderator.id})` : 'N/A'}`,
                    `**Raison:** ${log.reason || 'Aucune'}`,
                    `**Date:** <t:${Math.floor(new Date(log.date).getTime() / 1000)}:F>`
                ];

                if (log.channel) logDetails.push(`**Canal:** <#${log.channel.id}>`);
                if (log.extra) logDetails.push(`**Détails supplémentaires:** ${log.extra}`);

                return `**${index + 1}.**\n${logDetails.join('\n')}`;
            });

            const logsEmbed = {
                color: 0x0099ff,
                title: '📋 Logs',
                description: logsToShow.join('\n\n'),
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            message.channel.send({ embeds: [logsEmbed] });
        } catch (error) {
            console.error('Erreur lors de la lecture des logs:', error);
            message.reply('❌ Une erreur est survenue lors de la lecture des logs.');
        }
    }
};
