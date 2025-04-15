const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'role',
    description: 'Gère les rôles des utilisateurs',
    usage: '+role <add/remove/info> @utilisateur @role',
    permissions: 'ManageRoles',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Permission manquante: Gérer les rôles');
        }

        const action = args[0]?.toLowerCase();
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!['add', 'remove', 'info'].includes(action) || !member) {
            return message.reply('❌ Usage: `+role <add/remove/info> @utilisateur @role`');
        }

        switch(action) {
            case 'add':
                if (!role) return message.reply('❌ Mentionnez un rôle à ajouter');
                try {
                    await member.roles.add(role);
                    message.reply(`✅ Rôle ${role.name} ajouté à ${member.user.tag}`);
                } catch (error) {
                    message.reply('❌ Impossible d\'ajouter ce rôle');
                }
                break;

            case 'remove':
                if (!role) return message.reply('❌ Mentionnez un rôle à retirer');
                try {
                    await member.roles.remove(role);
                    message.reply(`✅ Rôle ${role.name} retiré de ${member.user.tag}`);
                } catch (error) {
                    message.reply('❌ Impossible de retirer ce rôle');
                }
                break;

            case 'info':
                const roles = member.roles.cache
                    .sort((a, b) => b.position - a.position)
                    .map(r => r.name)
                    .join(', ');
                
                const embed = {
                    color: member.displayColor || 0x0099ff,
                    title: `Rôles de ${member.user.tag}`,
                    description: roles || 'Aucun rôle',
                    fields: [
                        { name: 'Nombre de rôles', value: member.roles.cache.size.toString(), inline: true },
                        { name: 'Rôle le plus haut', value: member.roles.highest.name, inline: true }
                    ]
                };
                message.reply({ embeds: [embed] });
                break;
        }
    }
};
