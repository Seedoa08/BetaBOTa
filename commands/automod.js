const { PermissionsBitField, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config');
const automodFile = path.join(configPath, 'automod.json');

// Structure par défaut de la configuration automod
const defaultConfig = {
    enabled: false,
    filters: {
        badwords: false,
        spam: false,
        mentions: false,
        links: false,
        invites: false,
        caps: false
    },
    thresholds: {
        mentions: 5,
        caps: 70,
        spam: 5
    },
    whitelist: {
        channels: [],
        roles: [],
        users: []
    },
    actions: {
        warn: true,
        delete: true,
        mute: false,
        kick: false,
        ban: false
    },
    muteTime: '10m',
    logChannel: null
};

module.exports = {
    name: 'automod',
    description: 'Configure le système d\'automodération',
    usage: '+automod setup',
    category: 'Configuration',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        // Charger ou créer la configuration
        let config = defaultConfig;
        if (fs.existsSync(automodFile)) {
            config = JSON.parse(fs.readFileSync(automodFile));
        }

        const updateConfig = () => {
            if (!fs.existsSync(configPath)) {
                fs.mkdirSync(configPath, { recursive: true });
            }
            fs.writeFileSync(automodFile, JSON.stringify(config, null, 4));
        };

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setTitle('⚙️ Configuration de l\'AutoMod')
            .setDescription('Utilisez les menus ci-dessous pour configurer l\'automodération.')
            .addFields(
                { 
                    name: 'État actuel',
                    value: config.enabled ? '✅ Activé' : '❌ Désactivé'
                },
                {
                    name: 'Filtres actifs',
                    value: Object.entries(config.filters)
                        .filter(([, enabled]) => enabled)
                        .map(([name]) => `✅ ${name}`)
                        .join('\n') || 'Aucun filtre actif'
                }
            );

        const filtersMenu = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('automod_filters')
                .setPlaceholder('Sélectionnez les filtres à activer')
                .setMinValues(0)
                .setMaxValues(6)
                .addOptions([
                    {
                        label: 'Mots interdits',
                        description: 'Filtre les insultes et mots interdits',
                        value: 'badwords',
                        emoji: '🤬'
                    },
                    {
                        label: 'Anti-Spam',
                        description: 'Prévient le spam de messages',
                        value: 'spam',
                        emoji: '🔁'
                    },
                    {
                        label: 'Anti-Mentions',
                        description: 'Limite les mentions en masse',
                        value: 'mentions',
                        emoji: '@️'
                    },
                    {
                        label: 'Anti-Liens',
                        description: 'Bloque les liens externes',
                        value: 'links',
                        emoji: '🔗'
                    },
                    {
                        label: 'Anti-Invites',
                        description: 'Bloque les invitations Discord',
                        value: 'invites',
                        emoji: '📨'
                    },
                    {
                        label: 'Anti-Majuscules',
                        description: 'Limite l\'usage des majuscules',
                        value: 'caps',
                        emoji: '🔠'
                    }
                ])
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('automod_toggle')
                .setLabel(config.enabled ? 'Désactiver' : 'Activer')
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('automod_settings')
                .setLabel('Paramètres')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('automod_whitelist')
                .setLabel('Whitelist')
                .setStyle(ButtonStyle.Secondary)
        );

        const configMessage = await message.reply({
            embeds: [embed],
            components: [filtersMenu, buttons]
        });

        const collector = configMessage.createMessageComponentCollector({
            time: 300000
        });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: '❌ Vous ne pouvez pas modifier cette configuration.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'automod_filters') {
                const selectedFilters = interaction.values;
                Object.keys(config.filters).forEach(filter => {
                    config.filters[filter] = selectedFilters.includes(filter);
                });
                updateConfig();
            }

            if (interaction.customId === 'automod_toggle') {
                config.enabled = !config.enabled;
                updateConfig();
            }

            // Mettre à jour l'embed
            embed.setFields(
                { 
                    name: 'État actuel',
                    value: config.enabled ? '✅ Activé' : '❌ Désactivé'
                },
                {
                    name: 'Filtres actifs',
                    value: Object.entries(config.filters)
                        .filter(([, enabled]) => enabled)
                        .map(([name]) => `✅ ${name}`)
                        .join('\n') || 'Aucun filtre actif'
                }
            );

            // Mettre à jour les boutons
            buttons.components[0]
                .setLabel(config.enabled ? 'Désactiver' : 'Activer')
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success);

            await interaction.update({
                embeds: [embed],
                components: [filtersMenu, buttons]
            });
        });

        collector.on('end', () => {
            configMessage.edit({ components: [] }).catch(() => {});
        });
    }
};
