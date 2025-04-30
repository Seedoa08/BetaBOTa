const { EmbedBuilder } = require('discord.js');

// ID de l'owner principal
const OWNER_ID = '1061373376767201360';

module.exports = {
    name: 'leave',
    description: 'Fait quitter le bot du serveur (Owner uniquement)',
    usage: '+leave [raison]',
    category: 'Owner',
    ownerOnly: true,
    async execute(message, args) {
        // Vérification stricte de l'ID de l'owner
        if (message.author.id !== OWNER_ID) {
            return message.reply('❌ Cette commande est réservée uniquement à l\'owner principal du bot.');
        }

        try {
            const reason = args.join(' ') || 'Aucune raison spécifiée';
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('👋 Au revoir')
                .setDescription(`Je quitte le serveur.\nRaison: ${reason}`)
                .setFooter({ 
                    text: `Demandé par ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            await message.guild.leave();
            
        } catch (error) {
            console.error('Erreur lors du leave:', error);
            message.reply('❌ Une erreur est survenue lors de la tentative de quitter le serveur.');
        }
    }
};
