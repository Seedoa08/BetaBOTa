const fs = require('fs');
const warningsFile = './warnings.json';
const ms = require('ms');
const userResolver = require('../utils/userResolver');
const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/ownerCheck');

module.exports = {
    name: 'warn',
    description: 'Avertit un utilisateur avec système de sanctions progressives.',
    usage: '+warn @utilisateur/ID [raison]',
    permissions: 'ModerateMembers',
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur à avertir.' },
        { name: '[raison]', description: 'Raison de l\'avertissement (facultatif).' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission d\'avertir des membres.');
        }

        const userIdentifier = args[0];
        if (!userIdentifier) {
            return message.reply('❌ Vous devez mentionner un utilisateur ou fournir son ID.');
        }

        const user = await userResolver(message.client, userIdentifier);
        if (!user) {
            return message.reply('❌ Utilisateur introuvable. Vérifiez l\'ID ou la mention.');
        }

        // Protection de l'owner
        if (isOwner(user.id)) {
            return message.reply('❌ Vous ne pouvez pas avertir le propriétaire du bot.');
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas dans le serveur.');
        }

        try {
            const warnings = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile, 'utf8')) : {};
            if (!warnings[user.id]) warnings[user.id] = [];

            const warnData = {
                reason,
                date: new Date().toISOString(),
                moderator: message.author.id,
                level: warnings[user.id].length + 1
            };

            warnings[user.id].push(warnData);

            // Nouveau système de sanctions progressives
            let sanction = 'Aucune';
            const warnCount = warnings[user.id].length;

            switch (warnCount) {
                case 3:
                    await member.timeout(ms('10m'), 'Accumulation de 3 avertissements');
                    sanction = '🔇 Mute de 10 minutes';
                    break;
                case 5:
                    await member.timeout(ms('1h'), 'Accumulation de 5 avertissements');
                    sanction = '🔇 Mute de 1 heure';
                    break;
                case 7:
                    await member.timeout(ms('12h'), 'Accumulation de 7 avertissements');
                    sanction = '🔇 Mute de 12 heures';
                    break;
                case 10:
                    await member.ban({ reason: 'Accumulation de 10 avertissements' });
                    sanction = '🔨 Bannissement permanent';
                    break;
            }

            fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 4));

            const warnEmbed = {
                color: 0xff9900,
                title: '⚠️ Nouvel avertissement',
                description: `${user.tag} a reçu un avertissement`,
                fields: [
                    { name: 'Raison', value: reason },
                    { name: 'Niveau', value: `Avertissement #${warnData.level}` },
                    { name: 'Sanction automatique', value: sanction },
                    { name: 'Total des avertissements', value: `${warnCount}/10` }
                ],
                footer: { text: `Modérateur: ${message.author.tag}` },
                timestamp: new Date()
            };

            if (sanction !== 'Aucune') {
                warnEmbed.fields.push({
                    name: '⚠️ Sanction appliquée',
                    value: `Une sanction automatique a été appliquée: ${sanction}`
                });
            }

            message.channel.send({ embeds: [warnEmbed] });

            // DM à l'utilisateur averti
            try {
                const dmEmbed = {
                    color: 0xff9900,
                    title: `⚠️ Vous avez reçu un avertissement sur ${message.guild.name}`,
                    description: `Vous avez maintenant ${warnCount} avertissement(s)`,
                    fields: [
                        { name: 'Raison', value: reason },
                        { name: 'Sanction', value: sanction }
                    ],
                    timestamp: new Date()
                };
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log('Impossible d\'envoyer un DM à l\'utilisateur');
            }

        } catch (error) {
            console.error('Erreur:', error);
            message.reply('❌ Une erreur est survenue lors de l\'avertissement.');
        }
    }
};
