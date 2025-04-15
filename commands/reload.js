const { ownerId } = require('../config/owner');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'reload',
    description: 'Recharge une commande ou toutes les commandes',
    usage: '+reload [commande]',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée au propriétaire du bot.');
        }

        if (!args.length) {
            // Recharger toutes les commandes
            message.client.commands.clear();
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                try {
                    delete require.cache[require.resolve(`./${file}`)];
                    const command = require(`./${file}`);
                    message.client.commands.set(command.name, command);
                } catch (error) {
                    message.channel.send(`❌ Erreur lors du rechargement de ${file}: ${error.message}`);
                }
            }
            
            return message.reply('✅ Toutes les commandes ont été rechargées !');
        }

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName);

        if (!command) {
            return message.reply('❌ Cette commande n\'existe pas.');
        }

        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.reply(`✅ La commande \`${command.name}\` a été rechargée !`);
        } catch (error) {
            console.error(error);
            message.reply(`❌ Erreur lors du rechargement de \`${command.name}\`:\n\`${error.message}\``);
        }
    }
};
