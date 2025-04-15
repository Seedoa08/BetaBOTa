let lastDeletedMessage = null;

module.exports = {
    name: 'snipe',
    description: 'Affiche le dernier message supprimé dans ce salon.',
    usage: '+snipe',
    permissions: 'Aucune',
    async execute(message) {
        if (!lastDeletedMessage || lastDeletedMessage.channel.id !== message.channel.id) {
            return message.reply('❌ Aucun message supprimé récemment dans ce salon.');
        }

        const snipeEmbed = {
            color: 0xff9900,
            author: {
                name: lastDeletedMessage.author.tag,
                icon_url: lastDeletedMessage.author.displayAvatarURL({ dynamic: true })
            },
            description: lastDeletedMessage.content || '*Aucun contenu (peut-être un embed ou une image)*',
            footer: {
                text: `Message supprimé dans #${lastDeletedMessage.channel.name}`
            },
            timestamp: lastDeletedMessage.createdAt
        };

        if (lastDeletedMessage.attachments.size > 0) {
            snipeEmbed.image = { url: lastDeletedMessage.attachments.first().proxyURL };
        }

        message.channel.send({ embeds: [snipeEmbed] });
    }
};
