const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/moderation.json');

// Configuration par défaut
const defaultConfig = {
    automod: true,
    spamProtection: true,
    raidProtection: true,
    logChannel: null,
    warningThreshold: 3,
    muteDuration: '1h',
    autoActions: {
        warn: true,
        mute: true,
        kick: false,
        ban: false
    }
};

// Créer le fichier de configuration s'il n'existe pas
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
}

module.exports = {
    name: 'modconfig',
    description: 'Configure les paramètres de modération',
    usage: '+modconfig',
    category: 'Configuration',
    permissions: 'Administrator',
    async execute(message) {
        let config = JSON.parse(fs.readFileSync(configPath));

        const updateEmbed = () => {
            return new EmbedBuilder()
                .setColor(0x2F3136)
                .setTitle('⚙️ Configuration de la Modération')
                .setDescription('Utilisez les boutons ci-dessous pour modifier les paramètres.')
                .addFields([
                    { 
                        name: 'État des systèmes',
                        value: [
                            `AutoMod: ${config.automod ? '✅' : '❌'}`,
                            `Anti-Spam: ${config.spamProtection ? '✅' : '❌'}`,
                            `Anti-Raid: ${config.raidProtection ? '✅' : '❌'}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: 'Paramètres',
                        value: [
                            `Seuil d'avertissements: ${config.warningThreshold}`,
                            `Durée du mute: ${config.muteDuration}`,
                            `Salon des logs: ${config.logChannel ? `<#${config.logChannel}>` : 'Non défini'}`
                        ].join('\n'),
                        inline: true
                    }
                ]);
        };

        const getButtons = () => {
            return [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('toggle_automod')
                        .setLabel('AutoMod')
                        .setStyle(config.automod ? ButtonStyle.Success : ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('toggle_spam')
                        .setLabel('Anti-Spam')
                        .setStyle(config.spamProtection ? ButtonStyle.Success : ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('toggle_raid')
                        .setLabel('Anti-Raid')
                        .setStyle(config.raidProtection ? ButtonStyle.Success : ButtonStyle.Danger)
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('set_threshold')
                        .setLabel('Seuil Warns')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('set_duration')
                        .setLabel('Durée Mute')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('set_logs')
                        .setLabel('Salon Logs')
                        .setStyle(ButtonStyle.Primary)
                )
            ];
        };

        const configMsg = await message.reply({
            embeds: [updateEmbed()],
            components: getButtons()
        });

        const collector = configMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 300000
        });

        collector.on('collect', async i => {
            await i.deferUpdate();

            switch (i.customId) {
                case 'toggle_automod':
                    config.automod = !config.automod;
                    break;
                case 'toggle_spam':
                    config.spamProtection = !config.spamProtection;
                    break;
                case 'toggle_raid':
                    config.raidProtection = !config.raidProtection;
                    break;
                case 'set_threshold':
                    await i.followUp({ 
                        content: 'Entrez le nouveau seuil d\'avertissements (1-10):',
                        ephemeral: true 
                    });
                    const thresholdMsg = await message.channel.awaitMessages({
                        filter: m => m.author.id === message.author.id && !isNaN(m.content) && m.content >= 1 && m.content <= 10,
                        max: 1,
                        time: 30000
                    });
                    if (thresholdMsg.size) {
                        config.warningThreshold = parseInt(thresholdMsg.first().content);
                        thresholdMsg.first().delete().catch(() => {});
                    }
                    break;
                case 'set_duration':
                    await i.followUp({
                        content: 'Entrez la nouvelle durée de mute (ex: 1h, 30m):',
                        ephemeral: true
                    });
                    const durationMsg = await message.channel.awaitMessages({
                        filter: m => m.author.id === message.author.id && /^\d+[mh]$/.test(m.content),
                        max: 1,
                        time: 30000
                    });
                    if (durationMsg.size) {
                        config.muteDuration = durationMsg.first().content;
                        durationMsg.first().delete().catch(() => {});
                    }
                    break;
                case 'set_logs':
                    await i.followUp({
                        content: 'Mentionnez le salon pour les logs:',
                        ephemeral: true
                    });
                    const logMsg = await message.channel.awaitMessages({
                        filter: m => m.author.id === message.author.id && m.mentions.channels.size > 0,
                        max: 1,
                        time: 30000
                    });
                    if (logMsg.size) {
                        config.logChannel = logMsg.first().mentions.channels.first().id;
                        logMsg.first().delete().catch(() => {});
                    }
                    break;
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            await configMsg.edit({
                embeds: [updateEmbed()],
                components: getButtons()
            });
        });

        collector.on('end', () => {
            configMsg.edit({ components: [] }).catch(() => {});
        });
    }
};
