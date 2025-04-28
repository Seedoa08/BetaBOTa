module.exports = {
    name: 'serverinfo',
    description: 'Affiche des informations détaillées sur le serveur.',
    usage: '+serverinfo',
    category: 'Utilitaire',
    permissions: null, // Aucune permission requise
    variables: [],
    async execute(message) {
        const { guild } = message;

        // Calculer les statistiques des membres
        const totalMembers = guild.memberCount;
        const humans = guild.members.cache.filter(member => !member.user.bot).size;
        const bots = guild.members.cache.filter(member => member.user.bot).size;
        const online = guild.members.cache.filter(member => member.presence?.status === 'online').size;
        const offline = guild.members.cache.filter(member => !member.presence || member.presence.status === 'offline').size;

        // Calculer les statistiques des salons
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const announcements = guild.channels.cache.filter(c => c.type === 5).size;
        const stages = guild.channels.cache.filter(c => c.type === 13).size;
        const forums = guild.channels.cache.filter(c => c.type === 15).size;

        // Calculer les statistiques des emojis et stickers
        const animatedEmojis = guild.emojis.cache.filter(emoji => emoji.animated).size;
        const staticEmojis = guild.emojis.cache.filter(emoji => !emoji.animated).size;
        const stickers = guild.stickers.cache.size;

        const serverInfoEmbed = {
            color: 0x0099ff,
            title: `📊 Informations sur ${guild.name}`,
            description: `${guild.description || '*Aucune description*'}`,
            thumbnail: { url: guild.iconURL({ dynamic: true, size: 512 }) },
            fields: [
                {
                    name: '👑 Informations générales',
                    value: [
                        `**Owner:** <@${guild.ownerId}>`,
                        `**Région:** ${guild.preferredLocale}`,
                        `**Créé le:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                        `**Niveau de boost:** ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`,
                        `**Niveau de vérification:** ${guild.verificationLevel}`,
                        `**Features:** ${guild.features.join(', ') || 'Aucune'}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '👥 Membres',
                    value: [
                        `**Total:** ${totalMembers}`,
                        `**Humains:** ${humans}`,
                        `**Bots:** ${bots}`,
                        `**En ligne:** ${online}`,
                        `**Hors ligne:** ${offline}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📜 Salons',
                    value: [
                        `**Catégories:** ${categories}`,
                        `**Textuels:** ${textChannels}`,
                        `**Vocaux:** ${voiceChannels}`,
                        `**Annonces:** ${announcements}`,
                        `**Stages:** ${stages}`,
                        `**Forums:** ${forums}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎨 Personnalisation',
                    value: [
                        `**Rôles:** ${guild.roles.cache.size}`,
                        `**Emojis:** ${staticEmojis} statiques, ${animatedEmojis} animés`,
                        `**Stickers:** ${stickers}`,
                        `**Bannière:** ${guild.banner ? '✅' : '❌'}`,
                        `**Splash:** ${guild.splash ? '✅' : '❌'}`
                    ].join('\n'),
                    inline: true
                }
            ],
            image: guild.bannerURL({ size: 1024 }) ? { url: guild.bannerURL({ size: 1024 }) } : null,
            footer: {
                text: `ID: ${guild.id} • Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        // Supprimer la section des salons "mis en avant" car le flag `FEATURED` est invalide
        // Vous pouvez ajouter d'autres informations pertinentes ici si nécessaire

        // Statistiques de sécurité
        serverInfoEmbed.fields.push({
            name: '🛡️ Sécurité',
            value: [
                `**2FA requis:** ${guild.mfaLevel === 1 ? '✅' : '❌'}`,
                `**Filtre explicite:** ${guild.explicitContentFilter}`,
                `**Notifications par défaut:** ${guild.defaultMessageNotifications}`,
                `**Modération activée:** ${guild.features.includes('COMMUNITY') ? '✅' : '❌'}`
            ].join('\n'),
            inline: false
        });

        await message.channel.send({ embeds: [serverInfoEmbed] });
    }
};
