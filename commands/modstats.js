const { PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'modstats',
    description: 'Affiche les statistiques de modération du serveur.',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les statistiques de modération.');
        }

        try {
            const warnings = fs.existsSync('./warnings.json') ? JSON.parse(fs.readFileSync('./warnings.json', 'utf8')) : {};
            const muteHistory = fs.existsSync('./muteHistory.json') ? JSON.parse(fs.readFileSync('./muteHistory.json', 'utf8')) : {};

            const stats = {
                totalWarnings: Object.values(warnings).reduce((acc, arr) => acc + arr.length, 0),
                totalMutes: Object.values(muteHistory).reduce((acc, data) => acc + (data.count || 0), 0),
                mostWarnedUsers: Object.entries(warnings)
                    .sort((a, b) => b[1].length - a[1].length)
                    .slice(0, 5)
            };

            const statsEmbed = {
                color: 0xff0000,
                title: '📊 Statistiques de modération',
                fields: [
                    { name: 'Avertissements totaux', value: stats.totalWarnings.toString(), inline: true },
                    { name: 'Mutes totaux', value: stats.totalMutes.toString(), inline: true },
                    { name: 'Utilisateurs les plus avertis', 
                      value: stats.mostWarnedUsers.length > 0 ? 
                             stats.mostWarnedUsers.map(([id, warns], index) => 
                                `${index + 1}. <@${id}> : ${warns.length} avertissement(s)`).join('\n') : 
                             'Aucun avertissement enregistré' 
                    }
                ],
                footer: { text: 'Statistiques mises à jour' },
                timestamp: new Date()
            };

            message.channel.send({ embeds: [statsEmbed] });
        } catch (error) {
            console.error('Erreur dans modstats:', error);
            message.reply('❌ Une erreur est survenue lors de la récupération des statistiques.');
        }
    }
};
