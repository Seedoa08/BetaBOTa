const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'logs',
    description: 'Configure le système de logs',
    usage: '+logs <setup/toggle> [#channel]',
    permissions: 'Administrator',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous n\'avez pas la permission de configurer les logs.');
        }

        const configPath = path.join(__dirname, '../data/logsConfig.json');
        let config = {};

        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath));
        }

        const subCommand = args[0]?.toLowerCase();
        switch (subCommand) {
            case 'setup':
                const channel = message.mentions.channels.first();
                if (!channel) return message.reply('❌ Mentionnez un salon pour les logs.');

                config[message.guild.id] = {
                    channelId: channel.id,
                    enabled: true,
                    events: {
                        messageDelete: true,
                        messageEdit: true,
                        memberBoost: true,
                        moderation: true,
                        memberJoin: true,
                        memberLeave: true,
                        roleUpdate: true
                    }
                };

                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                message.reply(`✅ Salon de logs configuré: ${channel}`);
                break;

            case 'toggle':
                if (!config[message.guild.id]) return message.reply('❌ Le système de logs n\'est pas configuré. Utilisez la commande `+logs setup` pour le configurer.');
                config[message.guild.id].enabled = !config[message.guild.id].enabled;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                message.reply(`✅ Système de logs ${config[message.guild.id].enabled ? 'activé' : 'désactivé'}.`);
                break;

            default:
                message.reply('❌ Sous-commande inconnue. Utilisez `setup` ou `toggle`.');
                break;
        }
    }
};
