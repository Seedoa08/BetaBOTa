const { PermissionsBitField } = require('discord.js');
const ms = require('ms');
const fs = require('fs');
const userResolver = require('../utils/userResolver');

const muteHistoryFile = './muteHistory.json';
const logsFile = './logs/moderation.json';
let muteHistory = {};

if (fs.existsSync(muteHistoryFile)) {
    muteHistory = JSON.parse(fs.readFileSync(muteHistoryFile, 'utf8'));
}

module.exports = {
    name: 'mute',
    description: 'Mute un utilisateur avec système progressif.',
    usage: '+mute @utilisateur/ID [durée] [raison]',
    permissions: 'ModerateMembers',
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur à mute.' },
        { name: '[durée]', description: 'Durée du mute (ex: 10m, 1h, 1d)' },
        { name: '[raison]', description: 'Raison du mute (facultatif).' },
        { name: '--notify', description: 'Envoie un DM à l\'utilisateur' },
        { name: '--silent', description: 'Mute silencieusement' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de mute des membres.');
        }

        const userIdentifier = args[0];
        if (!userIdentifier) {
            return message.reply('❌ Vous devez mentionner un utilisateur ou fournir son ID.');
        }

        const user = await userResolver(message.client, userIdentifier);
        if (!user) {
            return message.reply('❌ Utilisateur introuvable. Vérifiez l\'ID ou la mention.');
        }

        if (user.id === message.guild.ownerId) {
            return message.reply('❌ Vous ne pouvez pas mute le propriétaire du serveur.');
        }

        if (user.id === message.client.user.id) {
            return message.reply('❌ Vous ne pouvez pas mute le bot.');
        }

        const notify = args.includes('--notify');
        const silent = args.includes('--silent');
        args = args.filter(arg => !arg.startsWith('--'));

        const duration = args[1];
        const reason = args.slice(2).join(' ') || 'Aucune raison fournie.';

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        if (!member.moderatable || member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas mute cet utilisateur. Vérifiez vos permissions ou le rôle de l\'utilisateur.');
        }

        if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
            return message.reply('❌ Cet utilisateur est déjà mute.');
        }

        const durationMs = ms(duration);
        if (isNaN(durationMs)) {
            return message.reply('❌ Durée invalide! Exemple: `10m`, `1h`.');
        }

        // Système de mute progressif
        if (!muteHistory[user.id]) {
            muteHistory[user.id] = { count: 0, lastMute: null };
        }

        const userHistory = muteHistory[user.id];
        const baseDuration = ms('1h');
        const multiplier = Math.pow(2, userHistory.count); // Durée qui double à chaque mute
        const finalDuration = durationMs || (baseDuration * multiplier);

        userHistory.count++;
        userHistory.lastMute = Date.now();

        fs.writeFileSync(muteHistoryFile, JSON.stringify(muteHistory, null, 4));

        try {
            await member.timeout(finalDuration, reason);

            if (notify) {
                try {
                    const dmEmbed = {
                        color: 0xff9900,
                        title: `Vous avez été mute sur ${message.guild.name}`,
                        fields: [
                            { name: 'Durée', value: ms(finalDuration, { long: true }) },
                            { name: 'Raison', value: reason }
                        ],
                        timestamp: new Date()
                    };
                    await user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    message.channel.send('⚠️ Impossible d\'envoyer un DM à l\'utilisateur');
                }
            }

            if (!silent) {
                const muteEmbed = {
                    color: 0xff9900,
                    title: '🔇 Utilisateur mute',
                    fields: [
                        { name: 'Utilisateur', value: user.tag },
                        { name: 'Durée', value: ms(finalDuration, { long: true }) },
                        { name: 'Raison', value: reason }
                    ],
                    footer: { text: `Modérateur: ${message.author.tag}` },
                    timestamp: new Date()
                };
                message.channel.send({ embeds: [muteEmbed] });
            }

            // Enregistrer dans les logs
            const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
            logs.push({
                action: 'mute',
                user: { id: user.id, tag: user.tag },
                moderator: { id: message.author.id, tag: message.author.tag },
                reason,
                duration: ms(finalDuration, { long: true }),
                date: new Date().toISOString()
            });
            fs.writeFileSync(logsFile, JSON.stringify(logs, null, 4));
        } catch (error) {
            console.error('Erreur lors du mute:', error);
            message.reply('❌ Une erreur est survenue lors du mute.');
        }
    }
};
