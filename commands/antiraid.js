const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const raidConfigFile = './raidConfig.json';

module.exports = {
    name: 'antiraid',
    description: 'Configure le système anti-raid du serveur',
    usage: '+antiraid <on/off/config/status>',
    permissions: 'Administrator',
    variables: [
        { name: 'on', description: 'Active le système anti-raid' },
        { name: 'off', description: 'Désactive le système anti-raid' },
        { name: 'config', description: 'Configure les paramètres (joinLimit/timeWindow/action/punishment)' },
        { name: 'status', description: 'Affiche le statut actuel du système anti-raid' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Cette commande nécessite les permissions Administrateur.');
        }

        // Charger ou créer la configuration
        let raidConfig = {
            enabled: false,
            joinLimit: 5,           // Nombre de joins maximum
            timeWindow: 10000,      // Fenêtre de temps en ms (10 secondes)
            action: 'lockdown',     // lockdown/kick/ban
            punishment: 'ban',      // kick/ban pour les nouveaux comptes suspects
            logChannel: null,       // ID du canal de logs
            recentJoins: [],
            whitelist: [],          // IDs des utilisateurs ignorés
            minAccountAge: 86400000 // 24h en ms
        };

        if (fs.existsSync(raidConfigFile)) {
            raidConfig = { ...raidConfig, ...JSON.parse(fs.readFileSync(raidConfigFile)) };
        }

        const subCommand = args[0]?.toLowerCase();
        const setting = args[1]?.toLowerCase();
        const value = args[2];

        switch (subCommand) {
            case 'on':
                raidConfig.enabled = true;
                message.reply('✅ Mode anti-raid activé.');
                break;

            case 'off':
                raidConfig.enabled = false;
                message.reply('✅ Mode anti-raid désactivé.');
                break;

            case 'config':
                switch (setting) {
                    case 'joinlimit':
                        const limit = parseInt(value);
                        if (isNaN(limit) || limit < 1) return message.reply('❌ Veuillez spécifier un nombre valide.');
                        raidConfig.joinLimit = limit;
                        message.reply(`✅ Limite de joins réglée sur ${limit} membres.`);
                        break;

                    case 'time':
                        const time = parseInt(value);
                        if (isNaN(time) || time < 1) return message.reply('❌ Veuillez spécifier un nombre de secondes valide.');
                        raidConfig.timeWindow = time * 1000;
                        message.reply(`✅ Fenêtre de temps réglée sur ${time} secondes.`);
                        break;

                    case 'action':
                        if (!['lockdown', 'kick', 'ban'].includes(value)) {
                            return message.reply('❌ Action invalide. Utilisez: lockdown, kick, ou ban');
                        }
                        raidConfig.action = value;
                        message.reply(`✅ Action en cas de raid réglée sur: ${value}`);
                        break;

                    case 'logs':
                        const channel = message.mentions.channels.first();
                        if (!channel) return message.reply('❌ Veuillez mentionner un canal.');
                        raidConfig.logChannel = channel.id;
                        message.reply(`✅ Canal de logs réglé sur ${channel}`);
                        break;

                    default:
                        message.reply('❌ Option invalide. Utilisez: joinlimit, time, action, ou logs');
                        return;
                }
                break;

            case 'status':
                const statusEmbed = {
                    color: 0x0099ff,
                    title: '🛡️ Statut Anti-Raid',
                    fields: [
                        { name: 'État', value: raidConfig.enabled ? '✅ Activé' : '❌ Désactivé', inline: true },
                        { name: 'Limite de joins', value: `${raidConfig.joinLimit} membres`, inline: true },
                        { name: 'Fenêtre de temps', value: `${raidConfig.timeWindow / 1000}s`, inline: true },
                        { name: 'Action', value: raidConfig.action, inline: true },
                        { name: 'Punition', value: raidConfig.punishment, inline: true },
                        { name: 'Canal de logs', value: raidConfig.logChannel ? `<#${raidConfig.logChannel}>` : 'Non configuré', inline: true }
                    ],
                    timestamp: new Date()
                };
                message.channel.send({ embeds: [statusEmbed] });
                break;

            default:
                message.reply('❌ Commande invalide. Utilisez: on, off, config, ou status');
                return;
        }

        // Sauvegarder la configuration
        fs.writeFileSync(raidConfigFile, JSON.stringify(raidConfig, null, 4));
    }
};
