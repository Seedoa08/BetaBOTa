const { PermissionsBitField } = require('discord.js');
const { checkPermissions } = require('../utils/permissions');

module.exports = {
    name: 'rank',
    description: 'Ajoute un rôle à un utilisateur',
    usage: '+rank @role @utilisateur',
    permissions: 'ManageRoles',
    variables: [
        { name: '@role', description: 'Le rôle à ajouter' },
        { name: '@utilisateur', description: 'L\'utilisateur qui recevra le rôle' }
    ],
    async execute(message, args) {
        if (!checkPermissions(message, PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les rôles.');
        }

        const role = message.mentions.roles.first();
        const user = message.mentions.users.first();

        if (!role || !user) {
            return message.reply('❌ Usage: `+rank @role @utilisateur`');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        // Vérifier si le rôle est supérieur à celui de la personne qui fait la commande
        if (role.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas ajouter un rôle supérieur ou égal au vôtre.');
        }

        try {
            await member.roles.add(role);
            message.reply(`✅ Le rôle ${role} a été ajouté à ${user.tag}`);
        } catch (error) {
            // Utiliser le nouveau système de gestion des erreurs
            await message.client.errorHandler.handleError(error, 'commande rank');
            
            // Message d'erreur plus spécifique pour l'utilisateur
            if (error.code === 50013) {
                message.reply('❌ Je n\'ai pas les permissions nécessaires pour ajouter ce rôle. Le rôle doit être plus bas que mon rôle le plus haut.');
            } else {
                message.reply('❌ Une erreur est survenue lors de l\'ajout du rôle.');
            }
        }
    }
};
