const commandManager = require('../utils/commandManager');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        const { prefix } = require('../config/globals');
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args);
            commandManager.registerCommand(command);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande :', error);
            message.reply('Une erreur est survenue lors de l\'exécution de cette commande.');
        }
    }
};