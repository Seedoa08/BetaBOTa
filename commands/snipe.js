let lastDeletedMessages = new Map(); // Utiliser une Map pour gérer les messages supprimés par salon

module.exports = {
    name: 'snipe',
    description: 'Affiche le dernier message supprimé dans ce salon.',
    usage: '+snipe',
    permissions: 'Aucune',
    async execute(message) {
        const deletedMessage = lastDeletedMessages.get(message.channel.id);

        if (!deletedMessage) {
            return message.reply('❌ Aucun message supprimé récemment dans ce salon.');
        }

        const snipeEmbed = {
            color: 0xff9900,
            author: {
                name: deletedMessage.author.tag,
                icon_url: deletedMessage.author.displayAvatarURL({ dynamic: true })
            },
            description: deletedMessage.content || '*Aucun contenu (peut-être un embed ou une image)*',
            footer: {
                text: `Message supprimé dans #${deletedMessage.channel.name}`
            },
            timestamp: deletedMessage.createdAt
        };

        if (deletedMessage.attachments.size > 0) {
            snipeEmbed.image = { url: deletedMessage.attachments.first().proxyURL };
        }

        message.channel.send({ embeds: [snipeEmbed] });
    }
};
