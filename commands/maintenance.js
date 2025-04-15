const { ownerId } = require('../config/owner');
const fs = require('fs');

module.exports = {
    name: 'maintenance',
    description: 'Active/désactive le mode maintenance',
    usage: '+maintenance <on/off> [raison]',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        if (message.author.id !== ownerId) return message.reply('❌ Owner only.');

        const action = args[0]?.toLowerCase();
        const reason = args.slice(1).join(' ') || 'Maintenance en cours';

        if (!['on', 'off'].includes(action)) {
            return message.reply('❌ Utilisez `on` ou `off`');
        }

        const maintenanceData = {
            enabled: action === 'on',
            reason,
            timestamp: Date.now(),
            enabledBy: message.author.tag
        };

        fs.writeFileSync('./data/maintenance.json', JSON.stringify(maintenanceData, null, 2));

        if (action === 'on') {
            const embed = {
                color: 0xff0000,
                title: '🔧 Mode Maintenance Activé',
                description: reason,
                timestamp: new Date()
            };

            message.client.guilds.cache.forEach(guild => {
                const channel = guild.channels.cache.find(ch => ch.name === 'général' || ch.name === 'general');
                if (channel) channel.send({ embeds: [embed] }).catch(() => {});
            });
        }

        message.reply(`✅ Mode maintenance ${action === 'on' ? 'activé' : 'désactivé'}`);
    }
};
