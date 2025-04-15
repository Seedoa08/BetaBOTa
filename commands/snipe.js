const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'snipe',
    description: 'Affiche le dernier message supprimé dans le canal',
    usage: '+snipe',
    permissions: 'ManageMessages',
    async execute(message) {
        const snipedMessage = message.client.snipes.get(message.channel.id);

        if (!snipedMessage) {
            return message.reply('❌ Aucun message supprimé récemment dans ce canal.');
        }

        const embed = {
            color: 0x0099ff,
            author: {
                name: snipedMessage.author.tag,
                icon_url: snipedMessage.author.displayAvatarURL({ dynamic: true })
            },
            description: snipedMessage.content || '*Aucun contenu textuel*',
            footer: {
                text: `Message supprimé • ${snipedMessage.date}`
            },
            timestamp: new Date()
        };

        // Ajout des images si présentes dans le message supprimé
        if (snipedMessage.image) {
            embed.image = { url: snipedMessage.image };
        }

        await message.channel.send({ embeds: [embed] });
    }
};
