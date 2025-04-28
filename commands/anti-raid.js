const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    name: 'anti-raid',
    description: 'Configure la protection anti-raid',
    usage: '+anti-raid <setup/on/off/status>',
    permissions: 'Administrator',
    
    async execute(message, args) {
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const config = serverConfig.getServerConfig(message.guild.id);
        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'on':
                config.antiRaid.enabled = true;
                serverConfig.updateServerConfig(message.guild.id, config);
                return message.reply('✅ Protection anti-raid activée.');

            case 'off':
                config.antiRaid.enabled = false;
                serverConfig.updateServerConfig(message.guild.id, config);
                return message.reply('✅ Protection anti-raid désactivée.');

            case 'status':
                return message.reply(`📊 État de l'anti-raid: ${config.antiRaid.enabled ? '✅ Activé' : '❌ Désactivé'}`);

            default:
                return message.reply('❌ Utilisation: `+anti-raid <on/off/status>`');
        }
    }
};
