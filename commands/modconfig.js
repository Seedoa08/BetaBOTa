const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'modconfig',
    description: 'Configure la modération',
    usage: '+modconfig',
    permissions: 'Administrator',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const settings = {
            automod: true,
            spamProtection: true,
            raidProtection: true,
            logChannel: message.guild.channels.cache.find(c => c.name === 'mod-logs')?.id,
            warningThreshold: 3,
            muteDuration: '1h'
        };

        const embed = {
            color: 0x0099ff,
            title: '⚙️ Configuration de la Modération',
            fields: Object.entries(settings).map(([key, value]) => ({
                name: key,
                value: String(value),
                inline: true
            })),
            footer: {
                text: 'Utilisez les boutons ci-dessous pour modifier les paramètres'
            }
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('automod')
                .setLabel('AutoMod')
                .setStyle(settings.automod ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('spam')
                .setLabel('Anti-Spam')
                .setStyle(settings.spamProtection ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('raid')
                .setLabel('Anti-Raid')
                .setStyle(settings.raidProtection ? ButtonStyle.Success : ButtonStyle.Danger)
        );

        const msg = await message.reply({ embeds: [embed], components: [row] });

        // ... Collecteur d'interactions pour gérer les boutons
    }
};
