const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'reload',
    description: 'Recharge une commande',
    usage: '+reload [commande/all]',
    permissions: 'OwnerOnly',
    variables: [
        { name: 'commande', description: 'Nom de la commande à recharger' },
        { name: 'all', description: 'Recharge toutes les commandes' }
    ],
    async execute(message, args) {
        // Commande réservée aux owners uniquement
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
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

        // Ajout d'une option de rechargement complet
        if (args[0] === 'all') {
            const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
            const utilFiles = fs.readdirSync('./utils').filter(file => file.endsWith('.js'));

            // Rechargement des événements
            for (const file of eventFiles) {
                try {
                    delete require.cache[require.resolve(`../events/${file}`)];
                } catch (error) {
                    console.error(`Erreur lors du rechargement de l'événement ${file}:`, error);
                }
            }

            // Rechargement des utilitaires
            for (const file of utilFiles) {
                try {
                    delete require.cache[require.resolve(`../utils/${file}`)];
                } catch (error) {
                    console.error(`Erreur lors du rechargement de l'utilitaire ${file}:`, error);
                }
            }

            message.reply('✅ Tous les modules ont été rechargés !');
            return;
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
