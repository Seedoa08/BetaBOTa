const { ActivityType } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Affiche des informations sur un utilisateur.',
    usage: '+userinfo [@utilisateur]',
    category: 'Utilitaire',
    permissions: null, // Aucune permission requise
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur pour afficher ses informations (facultatif).' }
    ],
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        const isBanned = await message.guild.bans.fetch(user.id).catch(() => null);
        if (isBanned) {
            return message.reply(`❌ ${user.tag} est banni du serveur.`);
        }

        const roles = member ? member.roles.cache
            .filter(role => role.id !== message.guild.id) // Exclure le rôle @everyone
            .sort((a, b) => b.position - a.position) // Trier par position
            .map(role => `<@&${role.id}>`)
            .join(' ') || 'Aucun rôle' : 'Aucun rôle';

        const activities = member?.presence?.activities || [];
        const activityList = activities.map(activity => {
            let type;
            switch (activity.type) {
                case ActivityType.Custom:
                    type = 'Statut personnalisé';
                    break;
                case ActivityType.Playing:
                    type = 'Joue à';
                    break;
                case ActivityType.Streaming:
                    type = 'En stream';
                    break;
                case ActivityType.Listening:
                    type = 'Écoute';
                    break;
                case ActivityType.Watching:
                    type = 'Regarde';
                    break;
                case ActivityType.Competing:
                    type = 'En compétition';
                    break;
                default:
                    type = 'Activité';
            }
            return `**${type}**: ${activity.name || activity.state || 'Non spécifié'}`;
        }).join('\n') || 'Aucune activité visible';

        const boostInfo = member.premiumSinceTimestamp
            ? `Boost depuis <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`
            : 'Aucun boost';

        const userInfoEmbed = {
            color: 0x0099ff,
            title: `Informations sur ${user.tag}`,
            thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
            fields: [
                { name: 'ID', value: user.id, inline: true },
                { name: 'Pseudo', value: member ? member.displayName : 'Non disponible', inline: true },
                { name: 'Compte créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                { name: 'Rejoint le serveur le', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Non disponible', inline: false },
                { name: 'Boost', value: boostInfo, inline: true },
                { name: `Rôles [${member ? member.roles.cache.size - 1 : 0}]`, value: roles },
                { name: 'Activités', value: activityList }
            ],
            footer: {
                text: `Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        try {
            await message.channel.send({ embeds: [userInfoEmbed] });
        } catch (error) {
            console.error('Erreur dans la commande userinfo:', error);
            message.reply('❌ Une erreur est survenue lors de l\'envoi des informations.');
        }
    }
};
