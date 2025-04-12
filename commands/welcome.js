const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const { createEmbed } = require('../utils/embeds');
const theme = require('../config/theme');

module.exports = {
    name: 'welcome',
    description: 'Configure le système de bienvenue',
    usage: '+welcome <set/test/disable> [#canal]',
    permissions: 'Administrator',
    variables: [
        { name: 'set', description: 'Configure le canal de bienvenue' },
        { name: 'test', description: 'Teste le message de bienvenue' },
        { name: 'disable', description: 'Désactive le système de bienvenue' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Cette commande nécessite les permissions administrateur.');
        }

        const subCommand = args[0]?.toLowerCase();
        const configPath = './welcomeConfig.json';

        let welcomeConfig = {
            enabled: false,
            channelId: null,
            guildId: message.guild.id,
            message: "Bienvenue {user} sur **{server}** !\n\n🎮 Tu es notre {count}e membre\n📜 Lis le règlement pour accéder au serveur\n🎉 Passe un bon moment parmi nous !",
            color: "#00ff00",
            footer: "Rejoins-nous le {date}"
        };

        if (fs.existsSync(configPath)) {
            welcomeConfig = JSON.parse(fs.readFileSync(configPath));
        }

        switch (subCommand) {
            case 'set':
                const channel = message.mentions.channels.first();
                if (!channel) {
                    return message.reply('❌ Veuillez mentionner un canal valide. Exemple: `+welcome set #bienvenue`');
                }
                welcomeConfig.enabled = true;
                welcomeConfig.channelId = channel.id;
                welcomeConfig.guildId = message.guild.id;
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

function sendWelcomeMessage(member, config) {
    const welcomeChannel = member.guild.channels.cache.get(config.channelId);
    if (!welcomeChannel) return;

    const welcomeEmbed = {
        color: theme.colors.success,
        title: `${theme.emojis.members} Bienvenue sur ${member.guild.name} !`,
        description: config.message
            .replace('{user}', `${member}`)
            .replace('{server}', member.guild.name)
            .replace('{count}', member.guild.memberCount),
        thumbnail: { 
            url: member.user.displayAvatarURL({ dynamic: true, size: 256 }) 
        },
        image: { url: theme.banners.welcome },
        fields: [
            {
                name: `${theme.emojis.time} Compte créé`,
                value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                inline: true
            },
            {
                name: `${theme.emojis.members} Membres`,
                value: `${member.guild.memberCount}`,
                inline: true
            }
        ],
        footer: {
            text: config.footer,
            icon_url: member.guild.iconURL({ dynamic: true })
        }
    };

    welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
}

// Exportez la fonction pour l'utiliser dans index.js
module.exports.sendWelcomeMessage = sendWelcomeMessage;
