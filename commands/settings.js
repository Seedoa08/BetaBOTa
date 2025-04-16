const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { ownerId } = require('../config/owner');

module.exports = {
    name: 'settings',
    description: 'Configure les paramètres du bot pour le serveur',
    usage: '+settings [catégorie] [paramètre] [valeur]',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && 
            message.author.id !== ownerId) {
            return message.reply('❌ Vous devez être administrateur pour gérer les paramètres.');
        }

        const settingsPath = path.join(__dirname, '../data/settings.json');
        let settings = {};
        
        if (fs.existsSync(settingsPath)) {
            settings = JSON.parse(fs.readFileSync(settingsPath));
        }

        if (!settings[message.guild.id]) {
            settings[message.guild.id] = {
                automod: {
                    enabled: true,
                    spamThreshold: 5,
                    mentionLimit: 5,
                    capsLimit: 70
                },
                logging: {
                    enabled: true,
                    channel: null,
                    events: ['mod', 'messages', 'members']
                },
                protection: {
                    antiRaid: true,
                    antiSpam: true,
                    lockdownOnRaid: true
                }
            };
        }

        // Interface interactive avec boutons
        const settingsEmbed = {
            color: 0x0099ff,
            title: '⚙️ Paramètres du serveur',
            fields: Object.entries(settings[message.guild.id]).map(([category, values]) => ({
                name: category.charAt(0).toUpperCase() + category.slice(1),
                value: Object.entries(values).map(([key, value]) => 
                    `${key}: \`${value}\``
                ).join('\n')
            }))
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('automod')
                .setLabel('AutoMod')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('logging')
                .setLabel('Logs')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('protection')
                .setLabel('Protection')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await message.reply({
            embeds: [settingsEmbed],
            components: [row]
        });

        // Gestionnaire d'interactions
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 300000
        });

        collector.on('collect', async i => {
            // Logique de modification des paramètres
            const category = i.customId;
            const categorySettings = settings[message.guild.id][category];
            
            const updateEmbed = {
                color: 0x0099ff,
                title: `⚙️ Configuration - ${category}`,
                description: 'Modifiez les paramètres en utilisant les commandes :',
                fields: Object.entries(categorySettings).map(([key, value]) => ({
                    name: key,
                    value: `Valeur actuelle: \`${value}\`\nCommande: \`+settings ${category} ${key} <valeur>\``
                }))
            };

            await i.update({ embeds: [updateEmbed] });
        });

        // Sauvegarder les modifications
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }
};
