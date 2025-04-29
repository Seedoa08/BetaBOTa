const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const isOwner = require('../utils/isOwner');

const configPath = path.join(__dirname, '../data/automod.json');
const defaultConfig = {
    enabled: false,
    filters: {
        spam: { enabled: false, threshold: 5, interval: 5000 },
        caps: { enabled: false, threshold: 70 },
        links: { enabled: false, whitelist: [] },
        invites: { enabled: false },
        badwords: { enabled: false, words: [] },
        mentions: { enabled: false, maxMentions: 3 },
        emojis: { enabled: false, maxEmojis: 5 },
        duplicates: { enabled: false }
    },
    actions: {
        warn: true,
        delete: true,
        timeout: false,
        timeoutDuration: 300000, // 5 minutes
        notifyUser: true
    },
    ignoredChannels: [],
    ignoredRoles: [],
    logChannel: null
};

// Initialiser le fichier de configuration
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
}

module.exports = {
    name: 'automod',
    description: 'Configure le système d\'automodération',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const config = JSON.parse(fs.readFileSync(configPath));
        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'setup':
                const filtersMenu = new StringSelectMenuBuilder()
                    .setCustomId('automod_filters')
                    .setPlaceholder('Sélectionnez les filtres à activer')
                    .setMinValues(0)
                    .setMaxValues(8)
                    .addOptions([
                        {
                            label: 'Anti-Spam',
                            description: 'Prévient le spam de messages',
                            value: 'spam'
                        },
                        {
                            label: 'Majuscules',
                            description: 'Limite l\'utilisation des majuscules',
                            value: 'caps'
                        },
                        {
                            label: 'Liens',
                            description: 'Filtre les liens',
                            value: 'links'
                        },
                        {
                            label: 'Invitations',
                            description: 'Bloque les invitations Discord',
                            value: 'invites'
                        },
                        {
                            label: 'Mots interdits',
                            description: 'Filtre les mots interdits',
                            value: 'badwords'
                        },
                        {
                            label: 'Mentions',
                            description: 'Limite le nombre de mentions',
                            value: 'mentions'
                        },
                        {
                            label: 'Emojis',
                            description: 'Limite le nombre d\'emojis',
                            value: 'emojis'
                        },
                        {
                            label: 'Messages dupliqués',
                            description: 'Prévient les messages spam',
                            value: 'duplicates'
                        }
                    ]);

                const row = new ActionRowBuilder().addComponents(filtersMenu);

                await message.reply({
                    embeds: [{
                        color: 0x0099ff,
                        title: '⚙️ Configuration de l\'AutoMod',
                        description: 'Utilisez les menus ci-dessous pour configurer l\'automodération.',
                        fields: [
                            {
                                name: 'État actuel',
                                value: config.enabled ? '✅ Activé' : '❌ Désactivé'
                            },
                            {
                                name: 'Filtres actifs',
                                value: Object.entries(config.filters)
                                    .filter(([, settings]) => settings.enabled)
                                    .map(([name]) => `✅ ${name}`)
                                    .join('\n') || 'Aucun filtre actif'
                            }
                        ]
                    }],
                    components: [row]
                });
                break;

            case 'status':
                const statusEmbed = {
                    color: config.enabled ? 0x00ff00 : 0xff0000,
                    title: '📊 Status AutoMod',
                    fields: [
                        {
                            name: 'État',
                            value: config.enabled ? '✅ Activé' : '❌ Désactivé'
                        },
                        {
                            name: 'Filtres',
                            value: Object.entries(config.filters)
                                .map(([name, settings]) => `${settings.enabled ? '✅' : '❌'} ${name}`)
                                .join('\n')
                        },
                        {
                            name: 'Actions',
                            value: Object.entries(config.actions)
                                .map(([name, enabled]) => `${enabled ? '✅' : '❌'} ${name}`)
                                .join('\n')
                        }
                    ]
                };
                message.reply({ embeds: [statusEmbed] });
                break;

            // ... autres sous-commandes ...

            default:
                message.reply('❌ Usage: `+automod <setup/config/toggle/status>`');
        }
    }
};
