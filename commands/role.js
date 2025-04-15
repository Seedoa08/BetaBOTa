const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'role',
    description: 'Attribue ou retire un rôle à un utilisateur.',
    usage: '+role @utilisateur @role',
    permissions: 'ManageRoles',
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur.' },
        { name: '@role', description: 'Mention du rôle à attribuer ou retirer.' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les rôles.');
        }

        const user = message.mentions.users.first();
        const role = message.mentions.roles.first();

        if (!user || !role) {
            return message.reply('❌ Vous devez mentionner un utilisateur et un rôle.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('❌ Je ne peux pas gérer ce rôle car il est supérieur ou égal à mon rôle le plus élevé.');
        }

        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                message.reply(`✅ Le rôle ${role.name} a été retiré à ${user.tag}.`);
            } else {
                await member.roles.add(role);
                message.reply(`✅ Le rôle ${role.name} a été attribué à ${user.tag}.`);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion du rôle:', error);
            message.reply('❌ Une erreur est survenue lors de la gestion du rôle.');
        }
    }
};
