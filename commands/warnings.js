const fs = require('fs');
const warningsFile = './warnings.json';

module.exports = {
    name: 'warnings',
    description: 'Affiche les avertissements d\'un utilisateur.',
    usage: '+warnings @utilisateur',
    permissions: 'ManageMessages',
    variables: [
        { name: '@utilisateur', description: 'Mention de l\'utilisateur pour voir ses avertissements.' }
    ],
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Vous devez mentionner un utilisateur pour voir ses avertissements.');
        }

        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply('❌ Vous n\'avez pas la permission de voir les avertissements des utilisateurs.');
        }

        try {
            const warnings = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile, 'utf8')) : {};
            const userWarnings = warnings[user.id] || [];

            if (userWarnings.length === 0) {
                return message.reply(`✅ ${user.tag} n\'a aucun avertissement.`);
            }

            const warningsList = userWarnings.map((warn, index) => `**${index + 1}.** Raison: ${warn.reason} - Date: ${new Date(warn.date).toLocaleString()}`).join('\n');
            const truncatedWarnings = warningsList.length > 1024 ? warningsList.slice(0, 1021) + '...' : warningsList;

            message.reply(`📋 Avertissements pour ${user.tag}:\n${truncatedWarnings}`);
        } catch (error) {
            console.error('Erreur lors de la lecture des avertissements:', error);
            message.reply('❌ Une erreur est survenue lors de la lecture des avertissements.');
        }
    }
};
