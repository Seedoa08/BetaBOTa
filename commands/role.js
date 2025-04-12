const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'role',
    description: 'Gère les rôles des membres.',
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

        const action = args[0]?.toLowerCase();
        const user = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!action || !['add', 'remove', 'info'].includes(action)) {
            return message.reply('❌ Action invalide. Utilisez `add`, `remove` ou `info`.');
        }

        if (action === 'info' && role) {
            const roleInfo = {
                color: role.color,
                title: `ℹ️ Informations sur le rôle ${role.name}`,
                fields: [
                    { name: 'ID', value: role.id, inline: true },
                    { name: 'Couleur', value: role.hexColor, inline: true },
                    { name: 'Position', value: role.position.toString(), inline: true },
                    { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
                    { name: 'Membres', value: role.members.size.toString(), inline: true }
                ],
                timestamp: new Date()
            };
            return message.channel.send({ embeds: [roleInfo] });
        }

        if (!user || !role) {
            return message.reply('❌ Mentionnez un utilisateur et un rôle.');
        }

        try {
            if (action === 'add') {
                await user.roles.add(role);
                message.reply(`✅ Rôle ${role} ajouté à ${user}.`);
            } else if (action === 'remove') {
                await user.roles.remove(role);
                message.reply(`✅ Rôle ${role} retiré de ${user}.`);
            }
        } catch (error) {
            message.reply('❌ Je ne peux pas modifier ce rôle.');
        }
    }
};
