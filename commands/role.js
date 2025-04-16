const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'role',
    description: 'Gère les rôles des membres',
    usage: '+role <add/remove/info> @utilisateur @role',
    permissions: 'ManageRoles',
    variables: [
        { name: 'add', description: 'Ajoute un rôle à un utilisateur' },
        { name: 'remove', description: 'Retire un rôle à un utilisateur' },
        { name: 'info', description: 'Affiche les informations sur un rôle' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les rôles.');
        }

        const subCommand = args[0]?.toLowerCase();
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!member || !role) {
            return message.reply('❌ Vous devez mentionner un utilisateur et un rôle.');
        }

        switch (subCommand) {
            case 'add':
                if (member.roles.cache.has(role.id)) {
                    return message.reply('❌ Cet utilisateur a déjà ce rôle.');
                }

                await member.roles.add(role);
                message.reply(`✅ Le rôle ${role} a été ajouté à ${member}.`);
                break;

            case 'remove':
                if (!member.roles.cache.has(role.id)) {
                    return message.reply('❌ Cet utilisateur n\'a pas ce rôle.');
                }

                await member.roles.remove(role);
                message.reply(`✅ Le rôle ${role} a été retiré à ${member}.`);
                break;

            case 'info':
                const roleEmbed = {
                    color: role.color,
                    title: `ℹ️ Informations sur le rôle ${role.name}`,
                    fields: [
                        { name: 'ID', value: role.id, inline: true },
                        { name: 'Couleur', value: role.hexColor, inline: true },
                        { name: 'Position', value: `${role.position}`, inline: true },
                        { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
                        { name: 'Membres', value: `${role.members.size}`, inline: true },
                        { name: 'Créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true }
                    ]
                };
                message.reply({ embeds: [roleEmbed] });
                break;

            default:
                message.reply('❌ Usage: `+role <add/remove/info> @utilisateur @role`');
        }
    }
};
