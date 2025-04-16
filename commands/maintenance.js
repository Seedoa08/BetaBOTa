const { PermissionsBitField } = require('discord.js');
const fs = require('fs');

const maintenanceFile = './data/maintenance.json';

module.exports = {
    name: 'maintenance',
    description: 'Active/désactive le mode maintenance du bot',
    usage: '+maintenance <on/off> [raison]',
    permissions: 'OwnerOnly',
    variables: [
        { name: 'on/off', description: 'Active ou désactive le mode maintenance' },
        { name: 'raison', description: 'Raison de la maintenance (facultatif)' }
    ],
    async execute(message, args) {
        const { owners } = require('../config/owners');
        if (!owners.includes(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        const maintenance = {
            active: false,
            reason: null,
            startTime: null,
            activatedBy: null
        };

        // Charger l'état actuel de la maintenance
        if (fs.existsSync(maintenanceFile)) {
            Object.assign(maintenance, JSON.parse(fs.readFileSync(maintenanceFile)));
        }

        const action = args[0]?.toLowerCase();
        const reason = args.slice(1).join(' ') || 'Maintenance en cours';

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return message.reply('❌ Usage: `+maintenance <on/off/status> [raison]`');
        }

        switch (action) {
            case 'on':
                if (maintenance.active) {
                    return message.reply('❌ Le mode maintenance est déjà activé.');
                }
                maintenance.active = true;
                maintenance.reason = reason;
                maintenance.startTime = Date.now();
                maintenance.activatedBy = message.author.id;

                // Notification dans tous les serveurs
                message.client.guilds.cache.forEach(async guild => {
                    const systemChannel = guild.systemChannel || 
                                       guild.channels.cache.find(c => 
                                           c.permissionsFor(guild.members.me)
                                           .has(PermissionsBitField.Flags.SendMessages));
                    
                    if (systemChannel) {
                        const maintenanceEmbed = {
                            color: 0xFF0000,
                            title: '🛠️ Mode Maintenance Activé',
                            description: reason,
                            fields: [
                                { name: 'Durée estimée', value: 'Indéterminée' },
                                { name: 'Fonctionnalités limitées', value: '• Commandes restreintes\n• Système auto-mod désactivé\n• Logs temporairement suspendus' }
                            ],
                            footer: { text: 'Seules les commandes essentielles resteront actives' },
                            timestamp: new Date()
                        };
                        await systemChannel.send({ embeds: [maintenanceEmbed] });
                    }
                });
                break;

            case 'off':
                if (!maintenance.active) {
                    return message.reply('❌ Le mode maintenance n\'est pas activé.');
                }
                const duration = Date.now() - maintenance.startTime;
                maintenance.active = false;
                maintenance.reason = null;
                maintenance.startTime = null;

                // Notification de fin de maintenance
                message.client.guilds.cache.forEach(async guild => {
                    const systemChannel = guild.systemChannel || 
                                       guild.channels.cache.find(c => 
                                           c.permissionsFor(guild.members.me)
                                           .has(PermissionsBitField.Flags.SendMessages));
                    
                    if (systemChannel) {
                        const endMaintenanceEmbed = {
                            color: 0x00FF00,
                            title: '✅ Maintenance Terminée',
                            description: 'Toutes les fonctionnalités sont rétablies',
                            fields: [
                                { name: 'Durée totale', value: `${Math.floor(duration / 60000)} minutes` }
                            ],
                            timestamp: new Date()
                        };
                        await systemChannel.send({ embeds: [endMaintenanceEmbed] });
                    }
                });
                break;

            case 'status':
                const statusEmbed = {
                    color: maintenance.active ? 0xFF0000 : 0x00FF00,
                    title: '📊 État de la Maintenance',
                    fields: [
                        { name: 'État', value: maintenance.active ? '🔴 Activée' : '🟢 Désactivée' }
                    ]
                };
                
                if (maintenance.active) {
                    const duration = Date.now() - maintenance.startTime;
                    statusEmbed.fields.push(
                        { name: 'Raison', value: maintenance.reason },
                        { name: 'Durée', value: `${Math.floor(duration / 60000)} minutes` },
                        { name: 'Activé par', value: `<@${maintenance.activatedBy}>` }
                    );
                }
                
                await message.channel.send({ embeds: [statusEmbed] });
                break;
        }

        fs.writeFileSync(maintenanceFile, JSON.stringify(maintenance, null, 2));
    }
};
