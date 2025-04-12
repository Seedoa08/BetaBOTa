const { PermissionsBitField } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    name: 'derank',
    description: 'Retire un rôle à un utilisateur',
    usage: '+derank @role @utilisateur',
    permissions: 'ManageRoles',
    variables: [
        { name: '@role', description: 'Le rôle à retirer' },
        { name: '@utilisateur', description: 'L\'utilisateur qui perdra le rôle' }
    ],
    async execute(message, args) {
        if (!checkPermissions(message, PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les rôles.');
        }

        const role = message.mentions.roles.first();
        const user = message.mentions.users.first();

        if (!role || !user) {
            return message.reply('❌ Usage: `+derank @role @utilisateur`');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        // Vérifier si le rôle est supérieur à celui de la personne qui fait la commande
        if (role.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas retirer un rôle supérieur ou égal au vôtre.');
        }

        // Vérifier si l'utilisateur a le rôle
        if (!member.roles.cache.has(role.id)) {
            return message.reply('❌ Cet utilisateur n\'a pas ce rôle.');
        }

        try {
            await member.roles.remove(role);
            message.reply(`✅ Le rôle ${role} a été retiré à ${user.tag}`);
        } catch (error) {
            console.error('Erreur lors du retrait du rôle:', error);
            message.reply('❌ Une erreur est survenue lors du retrait du rôle.');
        }
    }
};
