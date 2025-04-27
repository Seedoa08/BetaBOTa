const fs = require('fs');
const warningsFile = './warnings.json';

module.exports = {
    name: 'warn',
    description: 'Gère les avertissements des utilisateurs.',
    usage: '+warn <add/remove/list> @utilisateur [raison]',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les avertissements.');
        }

        const subCommand = args[0]?.toLowerCase();
        const user = message.mentions.users.first();
        const reason = args.slice(2).join(' ') || 'Aucune raison fournie.';
        const warnings = fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile)) : {};

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
