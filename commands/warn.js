const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const isOwner = require('../utils/isOwner');

// Définir les chemins des fichiers
const dataPath = path.join(__dirname, '../data');
const warningsFile = path.join(dataPath, 'warnings.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

// Initialiser le fichier warnings s'il n'existe pas
if (!fs.existsSync(warningsFile)) {
    fs.writeFileSync(warningsFile, JSON.stringify({}), 'utf8');
}

module.exports = {
    name: 'warn',
    description: 'Gère les avertissements des utilisateurs.',
    usage: '+warn <add/remove/list> @utilisateur [raison]',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        // Vérifier uniquement les permissions du bot
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Je n\'ai pas la permission de warn des membres.');
        }

        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de warn des membres.');
        }

        const subCommand = args[0]?.toLowerCase();
        const user = message.mentions.users.first();
        
        // Vérifier si l'utilisateur ciblé est un owner
        if (isOwner(user.id)) {
            return message.reply('❌ Vous ne pouvez pas donner d\'avertissement à un owner du bot.');
        }

        const reason = args.slice(2).join(' ') || 'Aucune raison fournie.';
        const warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
        
        if (!['add', 'remove', 'list'].includes(subCommand)) {
            return message.reply('❌ Commande invalide. Utilisez `add`, `remove` ou `list`.');
        }

        if (!user) {
            return message.reply('❌ Vous devez mentionner un utilisateur.');
        }

        switch (subCommand) {
            case 'add':
                warnings[user.id] = (warnings[user.id] || []).concat({ reason, date: new Date().toISOString() });
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 4));
                return message.reply(`✅ ${user.tag} a été averti. Raison: ${reason}`);

            case 'remove':
                if (!warnings[user.id] || warnings[user.id].length === 0) {
                    return message.reply(`❌ ${user.tag} n'a aucun avertissement.`);
                }
                warnings[user.id].pop();
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 4));
                return message.reply(`✅ Dernier avertissement de ${user.tag} supprimé.`);

            case 'list':
                const userWarnings = warnings[user.id] || [];
                if (userWarnings.length === 0) {
                    return message.reply(`✅ ${user.tag} n'a aucun avertissement.`);
                }
                const warningList = userWarnings.map((warn, index) => `**${index + 1}.** Raison: ${warn.reason} - Date: ${new Date(warn.date).toLocaleString()}`).join('\n');
                return message.reply(`📋 Avertissements pour ${user.tag}:\n${warningList}`);
        }
    }
};
