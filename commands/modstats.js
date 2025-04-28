const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'modstats',
    description: 'Affiche les statistiques de modération',
    usage: '+modstats [@modérateur]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les statistiques de modération.');
        }

        const mod = message.mentions.users.first() || message.author;
        const stats = await this.getModStats(mod.id);

        const embed = {
            color: 0x4caf50,
            author: {
                name: `Statistiques de modération de ${mod.tag}`,
                icon_url: mod.displayAvatarURL({ dynamic: true })
            },
            fields: [
                { name: 'Messages supprimés', value: stats.deleted.toString(), inline: true },
                { name: 'Avertissements', value: stats.warns.toString(), inline: true },
                { name: 'Mutes', value: stats.mutes.toString(), inline: true },
                { name: 'Kicks', value: stats.kicks.toString(), inline: true },
                { name: 'Bans', value: stats.bans.toString(), inline: true },
                { name: 'Total', value: stats.total.toString(), inline: true }
            ],
            footer: {
                text: 'Statistiques depuis le début'
            },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [embed] });
    }
};
