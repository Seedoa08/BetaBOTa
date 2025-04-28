const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'banner',
    description: 'Gère la bannière du serveur',
    permissions: 'ManageGuild',
    async execute(message, args) {
        // Vérifier uniquement les permissions du bot
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Je n\'ai pas la permission de gérer la bannière.');
        }

        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer la bannière.');
        }

        const user = message.mentions.users.first() || message.author;
        
        try {
            const fetchedUser = await user.fetch(true);
            const banner = fetchedUser.bannerURL({ size: 4096, dynamic: true });

            if (!banner) {
                return message.reply(`${user.tag} n'a pas de bannière.`);
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Bannière de ${user.tag}`)
                .setImage(banner)
                .setFooter({ 
                    text: `Demandé par ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur dans la commande banner:', error);
            message.reply('❌ Une erreur est survenue lors de la récupération de la bannière.');
        }
    }
};
