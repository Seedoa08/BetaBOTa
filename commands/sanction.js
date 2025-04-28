const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'sanction',
    description: 'Gère les sanctions des utilisateurs',
    usage: '+sanction <mute/unmute/ban/unban> @utilisateur [durée] [raison]',
    permissions: 'ModerateMembers',
    variables: [
        { name: '<mute/unmute/ban/unban>', description: 'Type de sanction à appliquer.' },
        { name: '@utilisateur', description: 'Mention de l\'utilisateur à sanctionner.' },
        { name: '[durée]', description: 'Durée de la sanction (facultatif).' },
        { name: '[raison]', description: 'Raison de la sanction (facultatif).' }
    ],
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les sanctions.');
        }

        const subCommand = args[0]?.toLowerCase();
        const user = message.mentions.users.first();
        const duration = args[1];
        const reason = args.slice(2).join(' ') || 'Aucune raison fournie.';

        if (!subCommand || !user) {
            return message.reply('❌ Utilisation incorrecte de la commande. Veuillez spécifier un type de sanction et un utilisateur.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        try {
            switch (subCommand) {
                case 'mute':
                    await member.timeout(duration, reason);
                    message.reply(`✅ ${user.tag} a été mute pour ${duration}. Raison: ${reason}`);
                    break;

                case 'unmute':
                    await member.timeout(null);
                    message.reply(`✅ ${user.tag} a été unmute.`);
                    break;

                case 'ban':
                    await member.ban({ reason });
                    message.reply(`✅ ${user.tag} a été banni. Raison: ${reason}`);
                    break;

                case 'unban':
                    await message.guild.bans.remove(user.id, reason);
                    message.reply(`✅ ${user.tag} a été débanni. Raison: ${reason}`);
                    break;

                default:
                    message.reply('❌ Type de sanction inconnu. Utilisez mute, unmute, ban ou unban.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande sanction:', error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};