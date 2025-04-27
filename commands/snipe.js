const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'snipe',
    description: 'Affiche les derniers messages supprimés',
    usage: '+snipe [nombre] [--channel #salon] [--user @utilisateur]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les messages supprimés.');
        }

        const options = {
            amount: 1,
            channel: message.channel,
            user: null
        };

        // Parser les arguments
        for (let i = 0; i < args.length; i++) {
            if (!isNaN(args[i])) {
                options.amount = Math.min(Math.max(parseInt(args[i]), 1), 10);
            } else if (args[i] === '--channel') {
                options.channel = message.mentions.channels.first() || message.channel;
            } else if (args[i] === '--user') {
                options.user = message.mentions.users.first();
            }
        }

        const snipes = message.client.snipes.get(options.channel.id);
        if (!snipes || !Array.isArray(snipes) || snipes.length === 0) {
            return message.reply('❌ Aucun message supprimé récent dans ce salon.');
        }

        let filteredSnipes = snipes;
        if (options.user) {
            filteredSnipes = snipes.filter(snipe => snipe.author.id === options.user.id);
        }

        // Limiter au nombre demandé
        filteredSnipes = filteredSnipes.slice(0, options.amount);

        if (filteredSnipes.length === 0) {
            return message.reply('❌ Aucun message supprimé correspondant aux critères.');
        }

        // Pour un seul message, afficher plus de détails
        if (filteredSnipes.length === 1) {
            const snipe = filteredSnipes[0];
            const embed = new EmbedBuilder()
                .setColor(0x2f3136)
                .setAuthor({
                    name: snipe.author.tag,
                    iconURL: snipe.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription(snipe.content || '*Aucun contenu textuel*')
                .setFooter({
                    text: `Message supprimé • ${snipe.channel.name}`,
                    iconURL: message.guild.iconURL({ dynamic: true })
                })
                .setTimestamp(new Date(snipe.timestamp));

            if (snipe.image) embed.setImage(snipe.image);
            if (snipe.attachments.length > 0) {
                embed.addFields({
                    name: '📎 Pièces jointes',
                    value: snipe.attachments.map(a => `[${a.name}](${a.url})`).join('\n')
                });
            }
            if (snipe.reference) {
                embed.addFields({
                    name: '↩️ Réponse à',
                    value: `[Message de ${snipe.reference.author.tag}](${snipe.reference.url})`
                });
            }

            return message.reply({ embeds: [embed] });
        }

        // Pour plusieurs messages, afficher un résumé
        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle(`📋 Derniers messages supprimés ${options.user ? `de ${options.user.tag}` : ''}`)
            .setDescription(
                filteredSnipes.map((snipe, i) => 
                    `**${i + 1}.** ${snipe.author.tag}: ${
                        snipe.content.length > 100 
                            ? snipe.content.slice(0, 100) + '...' 
                            : snipe.content || '*Aucun contenu textuel*'
                    }${
                        snipe.image || snipe.attachments.length > 0 
                            ? ' *(avec pièces jointes)*' 
                            : ''
                    }`
                ).join('\n\n')
            )
            .setFooter({
                text: `Salon: ${options.channel.name}`,
                iconURL: message.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
