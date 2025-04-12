const { PermissionsBitField } = require('discord.js');
const { createModEmbed } = require('../utils/embeds');
const theme = require('../config/theme');
const userResolver = require('../utils/userResolver');

module.exports = {
    name: 'ban',
    description: 'Bannit un utilisateur du serveur.',
    usage: '+ban @utilisateur/ID [raison]',
    permissions: 'BanMembers',
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur à bannir.' },
        { name: '[raison]', description: 'Raison du bannissement (facultatif).' },
        { name: '--silent', description: 'Bannir silencieusement sans message dans le salon' },
        { name: '--del [jours]', description: 'Supprimer les messages des X derniers jours (1-7)' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de bannir des membres.');
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Je n\'ai pas la permission de bannir des membres.');
        }

        const silentFlag = args.includes('--silent');
        const delDays = args.find(arg => arg.startsWith('--del'));
        const deleteMessageDays = delDays ? Math.min(7, Math.max(0, parseInt(delDays.split(' ')[1]) || 0)) : 0;

        // Remove flags from args
        args = args.filter(arg => !arg.startsWith('--'));

        const userIdentifier = args[0];
        if (!userIdentifier) {
            return message.reply('❌ Vous devez mentionner un utilisateur ou fournir son ID.');
        }

        const user = await userResolver(message.client, userIdentifier);
        if (!user) {
            return message.reply('❌ Utilisateur introuvable. Vérifiez l\'ID ou la mention.');
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        if (!member.bannable || member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas bannir cet utilisateur. Vérifiez vos permissions ou le rôle de l\'utilisateur.');
        }

        try {
            await member.ban({ 
                reason,
                deleteMessageDays
            });

            if (!silentFlag) {
                const banEmbed = {
                    color: 0xff0000,
                    title: '🔨 Bannissement',
                    fields: [
                        { name: 'Utilisateur', value: user.tag, inline: true },
                        { name: 'ID', value: user.id, inline: true },
                        { name: 'Raison', value: reason },
                        { name: 'Messages supprimés', value: `${deleteMessageDays} jours` }
                    ],
                    footer: { text: `Modérateur: ${message.author.tag}` },
                    timestamp: new Date()
                };
                await message.channel.send({ embeds: [banEmbed] });
            }
        } catch (error) {
            console.error('Erreur lors du bannissement:', error); // Journalisation détaillée
            message.reply('❌ Une erreur est survenue lors du bannissement.');
        }
    }
};
