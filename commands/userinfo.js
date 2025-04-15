module.exports = {
    name: 'userinfo',
    description: 'Affiche des informations détaillées sur un utilisateur.',
    usage: '+userinfo [@utilisateur]',
    permissions: 'Aucune',
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur pour afficher ses informations (facultatif).' }
    ],
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        const roles = member ? member.roles.cache
            .filter(role => role.id !== message.guild.id) // Exclure le rôle @everyone
            .sort((a, b) => b.position - a.position) // Trier par position
            .map(role => `<@&${role.id}>`)
            .join(' ') || 'Aucun rôle' : 'Aucun rôle';

        const activities = member?.presence?.activities || [];
        const activityList = activities.map(activity => {
            const type = activity.type === 'CUSTOM' ? 'Statut personnalisé' : activity.type.toLowerCase();
            return `**${type}**: ${activity.name || activity.state || 'Non spécifié'}`;
        }).join('\n') || 'Aucune activité visible';

        const userInfoEmbed = {
            color: 0x0099ff,
            title: `Informations sur ${user.tag}`,
            thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
            fields: [
                { name: 'ID', value: user.id, inline: true },
                { name: 'Pseudo', value: member ? member.displayName : 'Non disponible', inline: true },
                { name: 'Compte créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                { name: 'Rejoint le serveur le', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Non disponible', inline: false },
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
