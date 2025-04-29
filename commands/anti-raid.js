const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const isOwner = require('../utils/isOwner');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/antiraid.json');

function loadAntiRaidConfig() {
    const defaultConfig = {
        enabled: false,
        settings: {
            joinCooldown: 10,
            maxJoins: 5,
            accountAgeDays: 7,
            kickNewAccounts: true,
            banOnRejoin: true,
            lockdownThreshold: 10,
            autoLockdown: true,
            actionType: 'kick',
            timeoutDuration: 3600000
        },
        whitelist: [],
        logChannel: null,
        alertRole: null
    };

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }

    try {
        const savedConfig = JSON.parse(fs.readFileSync(configPath));
        return {
            ...defaultConfig,
            ...savedConfig,
            settings: {
                ...defaultConfig.settings,
                ...(savedConfig.settings || {})
            }
        };
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration anti-raid:', error);
        return defaultConfig;
    }
}

module.exports = {
    name: 'anti-raid',
    description: 'Configure le système anti-raid',
    usage: '+anti-raid <setup/toggle/status>',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour configurer l\'anti-raid.');
        }

        const subCommand = args[0]?.toLowerCase();
        const antiRaidConfig = loadAntiRaidConfig();

        switch (subCommand) {
            case 'setup':
                const setupEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Configuration Anti-Raid')
                    .setDescription('Utilisez les boutons ci-dessous pour configurer l\'anti-raid.')
                    .addFields(
                        { name: 'État actuel', value: antiRaidConfig.enabled ? '✅ Activé' : '❌ Désactivé', inline: true },
                        { name: 'Mode', value: antiRaidConfig.settings.actionType, inline: true }
                    );

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('antiraid_toggle')
                        .setLabel(antiRaidConfig.enabled ? 'Désactiver' : 'Activer')
                        .setStyle(antiRaidConfig.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('antiraid_mode')
                        .setLabel('Changer Mode')
                        .setStyle(ButtonStyle.Primary)
                );

                await message.reply({ embeds: [setupEmbed], components: [row] });
                break;

            case 'toggle':
                antiRaidConfig.enabled = !antiRaidConfig.enabled;
                fs.writeFileSync(configPath, JSON.stringify(antiRaidConfig, null, 2));
                message.reply(`✅ Anti-raid ${antiRaidConfig.enabled ? 'activé' : 'désactivé'}.`);
                break;

            case 'status':
                const statusEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Statut Anti-Raid')
                    .setDescription(`L'anti-raid est actuellement ${antiRaidConfig.enabled ? '✅ **ACTIVÉ**' : '❌ **DÉSACTIVÉ**'}`)
                    .addFields(
                        { name: 'Mode', value: antiRaidConfig.settings.actionType, inline: true },
                        { name: 'Max Joins', value: `${antiRaidConfig.settings.maxJoins}/${antiRaidConfig.settings.joinCooldown}s`, inline: true },
                        { name: 'Protection', value: [
                            `• Kick nouveaux comptes: ${antiRaidConfig.settings.kickNewAccounts ? '✅' : '❌'}`,
                            `• Auto Lockdown: ${antiRaidConfig.settings.autoLockdown ? '✅' : '❌'}`,
                            `• Ban si rejoin: ${antiRaidConfig.settings.banOnRejoin ? '✅' : '❌'}`
                        ].join('\n') }
                    );

                message.reply({ embeds: [statusEmbed] });
                break;

            default:
                message.reply('❌ Utilisation: `+anti-raid <setup/toggle/status>`');
        }
    }
};
