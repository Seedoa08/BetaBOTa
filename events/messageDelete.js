const LogManager = require('../utils/logManager');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        await LogManager.saveLog(message.guild.id, {
            type: 'message_delete',
            timestamp: new Date().toISOString(),
            content: message.content,
            author: message.author.tag,
            authorId: message.author.id,
            channel: message.channel.name,
            channelId: message.channel.id
        });
    }
};
