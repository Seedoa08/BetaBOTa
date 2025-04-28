const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'clearwarn',
    description: 'Supprime tous les avertissements d\'un utilisateur',
    usage: '+clearwarn @utilisateur',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les avertissements.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Vous devez mentionner un utilisateur.');
        }

        // Logique pour supprimer les avertissements de l'utilisateur
        // Cela dépend de la façon dont vous avez stocké les avertissements
        // Exemple avec un fichier JSON:

        const warningsFile = './warnings.json';
        const warnings = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile)) : {};

        if (!warnings[user.id] || warnings[user.id].length === 0) {
            return message.reply(`❌ ${user.tag} n'a aucun avertissement.`);
        }

        delete warnings[user.id];
        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 4));
        message.reply(`✅ Tous les avertissements de ${user.tag} ont été supprimés.`);
    }
};