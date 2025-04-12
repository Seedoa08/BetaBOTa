module.exports = {
    name: 'audit',
    description: 'Affiche les actions récentes dans le serveur.',
    async execute(interaction) {
        const auditLogs = await interaction.guild.fetchAuditLogs({ limit: 10 });
        const entries = auditLogs.entries.map(entry => {
            const target = entry.target ? `${entry.target.tag || entry.target.id}` : 'Inconnu';
            return `**Action**: ${entry.action}\n**Utilisateur**: ${entry.executor.tag}\n**Cible**: ${target}\n**Date**: <t:${Math.floor(entry.createdTimestamp / 1000)}:F>`;
        });

        const auditEmbed = {
            color: 0x0099ff,
            title: '📋 Logs d\'audit récents',
            description: entries.join('\n\n') || 'Aucune action récente.',
            timestamp: new Date()
        };

        interaction.reply({ embeds: [auditEmbed] });
    }
};
