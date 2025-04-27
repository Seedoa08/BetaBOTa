const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'rank',
    description: 'Affiche les membres ayant un rôle spécifique.',
    usage: '+rank @role | <roleID>',
    permissions: 'ManageRoles',
    variables: [
        { name: '@role | <roleID>', description: 'Mention ou ID du rôle pour afficher ses membres.' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les rôles.');
        }

        const roleIdentifier = args[0];
        if (!roleIdentifier) {
            return message.reply('❌ Vous devez mentionner un rôle ou fournir son ID.');
        }

        // Récupérer le rôle par mention ou ID
        const role = message.guild.roles.cache.get(roleIdentifier.replace(/[<@&>]/g, '')) || 
                     message.guild.roles.cache.find(r => r.name.toLowerCase() === roleIdentifier.toLowerCase());

        if (!role) {
            return message.reply('❌ Rôle introuvable. Assurez-vous que le rôle existe et que vous avez fourni une mention ou un ID valide.');
        }

        // Récupérer les membres ayant ce rôle
        const membersWithRole = role.members.map(member => `${member.user.tag} (${member.id})`).join('\n') || 'Aucun membre avec ce rôle.';

        const rankEmbed = {
            color: role.color || 0x0099ff,
            title: `📋 Membres avec le rôle ${role.name}`,
            description: membersWithRole,
            footer: {
                text: `ID du rôle: ${role.id}`,
                icon_url: message.guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        try {
            await message.channel.send({ embeds: [rankEmbed] });
        } catch (error) {
            console.error('Erreur dans la commande rank:', error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};
