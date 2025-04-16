const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'banner',
    description: 'Affiche la bannière d\'un utilisateur',
    usage: '+banner [@utilisateur]',
    permissions: 'Aucune',
    async execute(message, args) {
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
