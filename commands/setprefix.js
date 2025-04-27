const fs = require('fs');
const path = require('path');

const prefixesFile = path.join(__dirname, '../data/prefixes.json');

module.exports = {
    name: 'setprefix',
    description: 'Change le préfixe pour ce serveur.',
    usage: '+setprefix <nouveau préfixe>',
    permissions: 'ManageGuild',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply('❌ Vous n\'avez pas la permission de changer le préfixe.');
        }

        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length > 5) {
            return message.reply('❌ Veuillez fournir un préfixe valide (maximum 5 caractères).');
        }

        // Charger ou initialiser le fichier des préfixes
        const prefixes = fs.existsSync(prefixesFile) ? JSON.parse(fs.readFileSync(prefixesFile, 'utf8')) : {};

        // Mettre à jour le préfixe pour ce serveur
        prefixes[message.guild.id] = newPrefix;
        fs.writeFileSync(prefixesFile, JSON.stringify(prefixes, null, 4));

        return message.reply(`✅ Le préfixe a été changé en \`${newPrefix}\` pour ce serveur.`);
    }
};
