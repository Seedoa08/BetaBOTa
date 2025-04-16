const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'stats',
    description: 'Affiche les statistiques détaillées du serveur',
    usage: '+stats [moderation/users/server/commands]',
    permissions: 'ManageGuild',
    async execute(message, args) {
        const type = args[0]?.toLowerCase() || 'overview';
        const stats = await generateStats(message.guild, type);
        
        const embed = {
            color: 0x0099ff,
            title: `📊 Statistiques - ${type.toUpperCase()}`,
            fields: stats.fields,
            footer: {
                text: `Page 1/${stats.pages} • Mis à jour ${new Date().toLocaleString()}`
            }
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('mod_stats')
                    .setLabel('Modération')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('user_stats')
                    .setLabel('Utilisateurs')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('cmd_stats')
                    .setLabel('Commandes')
                    .setStyle(ButtonStyle.Primary)
            );

        const msg = await message.channel.send({ 
            embeds: [embed], 
            components: [row] 
        });

        // ... gestionnaire d'interactions
    }
};
