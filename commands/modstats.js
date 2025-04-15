const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const logsFile = './logs/moderation.json';

module.exports = {
    name: 'modstats',
    description: 'Affiche les statistiques de modération',
    usage: '+modstats [@modérateur]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les statistiques des modérateurs.');
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
