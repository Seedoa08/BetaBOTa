const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Supprime un certain nombre de messages dans le canal.',
    usage: '+clear [nombre] [--bots] [--users] [--from @user] [--before ID]',
    permissions: 'ManageMessages',
    variables: [
        { name: '[nombre]', description: 'Nombre de messages à supprimer (1-100)' },
        { name: '--bots', description: 'Supprimer uniquement les messages des bots' },
        { name: '--users', description: 'Supprimer uniquement les messages des utilisateurs' },
        { name: '--from @user', description: 'Supprimer les messages d\'un utilisateur spécifique' },
        { name: '--before ID', description: 'Supprimer les messages avant un message spécifique' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les messages.');
        }

            if (!message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageMessages)) {
                return message.reply('❌ Je n\'ai pas la permission de gérer les messages dans ce canal.');
                    }
                }
            }
        
           