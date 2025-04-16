const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const serverConfig = require('../utils/serverConfig');

const settingsPath = path.join(__dirname, '../data/raidSettings.json');

module.exports = {
    name: 'anti-raid',
    description: 'Configure la protection anti-raid du serveur',
    usage: '+anti-raid <on/off/settings> [options]',
    permissions: 'Administrator',
    
    getSettings(guildId) {
        let settings = {};
        if (fs.existsSync(settingsPath)) {
            const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            settings = data[guildId] || this.getDefaultSettings();
        }
        return settings;
    },

    getDefaultSettings() {
        return {
            enabled: false,
            joinThreshold: 10,
            timeWindow: 30000,
            accountAge: 7,
            actionType: 'kick',
            logChannel: null
        };
    },

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const config = serverConfig.getConfig(message.guild.id);
        
        if (args[0]?.toLowerCase() === 'on') {
            serverConfig.updateConfig(message.guild.id, { antiRaid: true });
            return message.reply('✅ Protection anti-raid activée pour ce serveur.');
        }

        if (args[0]?.toLowerCase() === 'off') {
            serverConfig.updateConfig(message.guild.id, { antiRaid: false });
            return message.reply('✅ Protection anti-raid désactivée pour ce serveur.');
        }

        const subCommand = args[0]?.toLowerCase();
        const settings = this.getSettings(message.guild.id);

        switch (subCommand) {
            case 'on':
                settings.enabled = true;
                await this.saveSettings(message.guild.id, settings);
                return message.reply('✅ Protection anti-raid activée.');

            case 'off':
                settings.enabled = false;
                await this.saveSettings(message.guild.id, settings);
                return message.reply('✅ Protection anti-raid désactivée.');

            case 'settings':
                const embed = {
                    color: 0x0099ff,
                    title: '⚙️ Paramètres Anti-Raid',
                    fields: [
                        { 
                            name: 'État', 
                            value: settings.enabled ? 'Activé ✅' : 'Désactivé ❌', 
                            inline: true 
                        },
                        { 
                            name: 'Seuil de joins', 
                            value: `${settings.joinThreshold || '10'} joins`, 
                            inline: true 
                        },
                        { 
                            name: 'Fenêtre de temps', 
                            value: `${(settings.timeWindow || 30000)/1000}s`, 
                            inline: true 
                        },
                        { 
                            name: 'Âge minimum compte', 
                            value: `${settings.accountAge || '7'} jours`, 
                            inline: true 
                        },
                        { 
                            name: 'Action', 
                            value: settings.actionType || 'kick', 
                            inline: true 
                        }
                    ],
                    footer: { text: 'Utilisez +anti-raid help pour plus d\'informations' }
                };
                return message.reply({ embeds: [embed] });

            default:
                return message.reply('❌ Usage: `+anti-raid <on/off/settings> [options]`');
        }
    },

    async saveSettings(guildId, settings) {
        let data = {};
        if (fs.existsSync(settingsPath)) {
            data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        }
        data[guildId] = settings;
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
    }
};
