const fs = require('fs');
const configPath = './config.json';

module.exports = {
    name: 'setprefix',
    description: 'Change le préfixe du bot (réservé à l\'owner).',
    async execute(message, args) {
        const ownerId = '1061373376767201360'; // Remplacez par votre ID Discord

        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return message.reply('❌ Vous devez spécifier un nouveau préfixe.');
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.prefix = newPrefix;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            message.reply(`✅ Préfixe mis à jour avec succès : \`${newPrefix}\``);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du préfixe:', error);
            message.reply('❌ Une erreur est survenue lors de la mise à jour du préfixe.');
        }
    }
};
