module.exports = {
    name: 'ping',
    description: 'Affiche la latence du bot et de l\'API Discord.',
    usage: '+ping',
    permissions: 'Aucune',
    async execute(message) {
        try {
            const sentMessage = await message.channel.send('🏓 Calcul de la latence...');
            const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
            const apiLatency = Math.round(message.client.ws.ping);

            const pingEmbed = {
                color: botLatency < 200 ? 0x00ff00 : 0xff9900,
                title: '🏓 Pong!',
                fields: [
                    { name: 'Latence du bot', value: `${botLatency}ms`, inline: true },
                    { name: 'Latence de l\'API', value: `${apiLatency}ms`, inline: true },
                    { name: 'Statut', value: botLatency < 200 ? '🟢 Excellent' : '🟠 Moyen', inline: true }
                ],
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            sentMessage.edit({ content: null, embeds: [pingEmbed] });
        } catch (error) {
            console.error('Erreur dans la commande ping:', error);
            message.reply('❌ Une erreur est survenue lors du calcul de la latence.');
        }
    }
};
