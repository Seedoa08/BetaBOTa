const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'snipe',
    description: 'Affiche le dernier message supprimé dans le canal.',
    usage: '+snipe',
    permissions: 'Aucune',
    async execute(message) {
        const snipes = message.client.snipes.get(message.channel.id);
        if (!snipes || snipes.length === 0) {
            return message.reply('❌ Aucun message supprimé trouvé dans ce canal.');
        }

        const snipe = snipes[0]; // Dernier message supprimé
        const snipeEmbed = {
            color: 0x0099ff,
            author: {
                name: snipe.author.tag,
                icon_url: snipe.author.displayAvatarURL({ dynamic: true })
            },
            description: snipe.content || '*Aucun contenu*',
            fields: [
                { name: 'Salon', value: `<#${snipe.channel.id}>`, inline: true },
                { name: 'Date', value: `<t:${Math.floor(snipe.timestamp / 1000)}:F>`, inline: true }
            ],
            footer: {
                text: `ID: ${snipe.author.id}`
            },
            timestamp: new Date(snipe.timestamp)
        };

        if (snipe.image) {
            snipeEmbed.image = { url: snipe.image };
        }

        try {
            await message.channel.send({ embeds: [snipeEmbed] });
        } catch (error) {
            console.error('Erreur dans la commande snipe:', error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};
