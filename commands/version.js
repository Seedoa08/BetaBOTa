const changelogManager = require('../utils/changelogManager');
const { version } = require('../package.json');

module.exports = {
    name: 'version',
    description: 'Affiche la version actuelle et les changements récents',
    usage: '+version [latest/all]',
    permissions: 'Aucune',
    async execute(message, args) {
        const option = args[0]?.toLowerCase();

        if (option === 'all') {
            const changes = changelogManager.getAllChanges();
            const allVersionsEmbed = {
                color: 0x0099ff,
                title: '📋 Historique des versions',
                description: 'Liste complète des mises à jour',
                fields: changes.map(v => ({
                    name: `Version ${v.version} (${v.date})`,
                    value: v.changes.map(c => `• ${c}`).join('\n')
                })),
                footer: {
                    text: `Version actuelle : ${version}`
                },
                timestamp: new Date()
            };
            
            return message.channel.send({ embeds: [allVersionsEmbed] });
        }

        // Afficher la dernière version par défaut
        const latest = changelogManager.getLatestChanges();
        const versionEmbed = {
            color: 0x00ff00,
            title: `📦 Version ${version}`,
            description: 'Dernière mise à jour du bot',
            fields: [
                {
                    name: 'Date',
                    value: latest.date,
                    inline: true
                },
                {
                    name: 'Changements',
                    value: latest.changes.map(c => `• ${c}`).join('\n'),
                    inline: false
                }
            ],
            footer: {
                text: 'Utilisez "+version all" pour voir l\'historique complet'
            },
            timestamp: new Date()
        };

        return message.channel.send({ embeds: [versionEmbed] });
    }
};
