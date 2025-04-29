const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'giveaway',
    description: 'Créer un giveaway',
    usage: '+giveaway <durée> <gagnants> <prix>',
    category: 'Modération',
    permissions: 'ManageEvents',
    async execute(message, args) {
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply('❌ Usage: `+giveaway <durée> <gagnants> <prix>`\nExemple: `+giveaway 1h 1 Nitro`');
        }

        const duration = ms(args[0]);
        if (!duration || duration < 10000) {
            return message.reply('❌ Veuillez spécifier une durée valide (minimum 10s).');
        }

        const winners = parseInt(args[1]);
        if (isNaN(winners) || winners < 1) {
            return message.reply('❌ Veuillez spécifier un nombre valide de gagnants.');
        }

        const prize = args.slice(2).join(' ');
        if (!prize) {
            return message.reply('❌ Veuillez spécifier un prix.');
        }

        const endTime = Date.now() + duration;

        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(
                `**Prix:** ${prize}\n` +
                `**Gagnant(s):** ${winners}\n` +
                `**Fin:** <t:${Math.floor(endTime/1000)}:R>\n\n` +
                `Réagissez avec 🎉 pour participer!`
            )
            .setFooter({ text: `Organisé par ${message.author.tag}` })
            .setTimestamp(endTime);

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_enter')
                    .setLabel('Participer!')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Primary)
            );

        const giveawayMsg = await message.channel.send({
            embeds: [embed],
            components: [button]
        });

        // Stocker les informations du giveaway
        const giveawayData = {
            messageId: giveawayMsg.id,
            channelId: message.channel.id,
            guildId: message.guild.id,
            prize,
            winners,
            endTime,
            participants: new Set(),
            ended: false
        };

        setTimeout(() => endGiveaway(giveawayData), duration);
    }
};

async function endGiveaway(giveaway) {
    if (giveaway.ended) return;
    giveaway.ended = true;

    try {
        const channel = await client.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(giveaway.messageId);

        const winners = pickWinners(Array.from(giveaway.participants), giveaway.winners);
        const winnerText = winners.length ? winners.map(w => `<@${w}>`).join(', ') : 'Aucun participant valide';

        const endEmbed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('🎉 GIVEAWAY TERMINÉ 🎉')
            .setDescription(
                `**Prix:** ${giveaway.prize}\n` +
                `**Gagnant(s):** ${winnerText}\n` +
                `**Participants:** ${giveaway.participants.size}`
            )
            .setTimestamp();

        await message.edit({
            embeds: [endEmbed],
            components: []
        });

        if (winners.length) {
            channel.send({
                content: `🎉 Félicitations ${winnerText}! Vous avez gagné **${giveaway.prize}**!`,
                allowedMentions: { users: winners }
            });
        }
    } catch (error) {
        console.error('Erreur giveaway:', error);
    }
}

function pickWinners(participants, count) {
    const winners = [];
    while (winners.length < count && participants.length > 0) {
        const winnerIndex = Math.floor(Math.random() * participants.length);
        winners.push(participants[winnerIndex]);
        participants.splice(winnerIndex, 1);
    }
    return winners;
}
