const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'banner',
    description: 'Affiche la bannière du serveur ou d\'un utilisateur',
    usage: '+banner [user]',
    category: 'Utilitaire',
    permissions: null,
    async execute(message, args) {
        try {
            if (args[0]?.toLowerCase() === 'server') {
                const banner = message.guild.bannerURL({ size: 4096, dynamic: true });
                if (!banner) {
                    return message.reply('❌ Ce serveur n\'a pas de bannière.');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`Bannière de ${message.guild.name}`)
                    .setColor(0x0099FF)
                    .setImage(banner)
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
                return;
            }

            const user = message.mentions.users.first() || message.author;
            const member = await message.guild.members.fetch(user.id);
            const banner = user.bannerURL({ size: 4096, dynamic: true });

            if (!banner) {
                return message.reply('❌ Cet utilisateur n\'a pas de bannière.');
            }

            const embed = new EmbedBuilder()
                .setTitle(`Bannière de ${user.tag}`)
                .setColor(member.displayHexColor || 0x0099FF)
                .setImage(banner)
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur banner:', error);
            message.reply('❌ Une erreur est survenue lors de la récupération de la bannière.');
        }
    }
};
