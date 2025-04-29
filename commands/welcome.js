const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const isOwner = require('../utils/isOwner');

const configPath = path.join(__dirname, '../data/welcomeConfig.json');
const defaultConfig = {
    enabled: false,
    channelId: null,
    message: "Bienvenue {user} sur {server} !\nTu es notre {count}ème membre !",
    footer: "Rejoint le {date}",
    color: "#0099ff",
    embedTitle: "👋 Nouveau membre",
    embedDescription: "Un nouveau membre vient de nous rejoindre !",
    thumbnail: true,
    showJoinDate: true
};

function loadConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration welcome:', error);
        return defaultConfig;
    }
}

function sendWelcomeMessage(member, config) {
    if (!config || !config.message) {
        config = defaultConfig;
    }

    const welcomeChannel = member.guild.channels.cache.get(config.channelId);
    if (!welcomeChannel) return;

    const welcomeEmbed = {
        color: parseInt(config.color?.replace('#', '') || '0099ff', 16),
        title: config.embedTitle || defaultConfig.embedTitle,
        description: (config.message || defaultConfig.message)
            .replace('{user}', member.toString())
            .replace('{server}', member.guild.name)
            .replace('{count}', member.guild.memberCount),
        thumbnail: config.thumbnail ? {
            url: member.user.displayAvatarURL({ dynamic: true })
        } : null,
        footer: {
            text: (config.footer || defaultConfig.footer).replace('{date}', new Date().toLocaleDateString()),
            icon_url: member.guild.iconURL({ dynamic: true })
        },
        timestamp: new Date()
    };

    welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
}

module.exports = {
    name: 'welcome',
    description: 'Configure le système de bienvenue',
    usage: '+welcome <setup/config/test/toggle>',
    permissions: 'ManageGuild',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour configurer le message de bienvenue.');
        }

        const subCommand = args[0]?.toLowerCase();
        let welcomeConfig = loadConfig();

        switch (subCommand) {
            case 'set':
                const channel = message.mentions.channels.first();
                if (!channel) {
                    return message.reply('❌ Veuillez mentionner un canal valide. Exemple: `+welcome set #bienvenue`');
                }
                welcomeConfig.enabled = true;
                welcomeConfig.channelId = channel.id;
                fs.writeFileSync(configPath, JSON.stringify(welcomeConfig, null, 4));
                message.reply(`✅ Canal de bienvenue configuré sur ${channel}.`);
                break;

            case 'test':
                if (!welcomeConfig.enabled) {
                    return message.reply('❌ Le système de bienvenue n\'est pas activé.');
                }
                sendWelcomeMessage(message.member, welcomeConfig);
                message.reply('✅ Message de test envoyé.');
                break;

            case 'disable':
                welcomeConfig.enabled = false;
                fs.writeFileSync(configPath, JSON.stringify(welcomeConfig, null, 4));
                message.reply('✅ Système de bienvenue désactivé.');
                break;

            default:
                message.reply('❌ Utilisation: `+welcome set #canal`, `+welcome test` ou `+welcome disable`');
        }
    }
};
