const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pic',
    description: 'Affiche l\'image de profil d\'un utilisateur',
    usage: '+pic [@utilisateur]',
    permissions: 'Aucune',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const avatar = user.displayAvatarURL({ size: 4096, dynamic: true });

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Avatar de ${user.tag}`)
            .setImage(avatar)
            .setFooter({ 
                text: `Demandé par ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            });

        await message.reply({ embeds: [embed] });
    }
};
