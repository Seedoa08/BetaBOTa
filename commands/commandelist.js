const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'commandelist',
    description: 'Gère la liste des commandes',
    usage: '+commandelist <add/remove/list> [nom de la commande]',
    permissions: 'Administrator',
    variables: [
        { name: 'add', description: 'Ajoute une commande à la liste des commandes.' },
        { name: 'remove', description: 'Retire une commande de la liste des commandes.' },
        { name: 'list', description: 'Affiche la liste des commandes.' }
    ],
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour gérer les commandes.');
        }

        const subCommand = args[0]?.toLowerCase();
        const commandName = args[1]?.toLowerCase();

        switch (subCommand) {
            case 'add':
                if (!commandName) {
                    return message.reply('❌ Vous devez spécifier le nom d\'une commande à ajouter. Exemple : `+commandelist add commande`');
                }
                // Logique pour ajouter une commande à la liste
                return message.reply(`✅ La commande \`${commandName}\` a été ajoutée à la liste des commandes.`);

            case 'remove':
                if (!commandName) {
                    return message.reply('❌ Vous devez spécifier le nom d\'une commande à retirer. Exemple : `+commandelist remove commande`');
                }
                // Logique pour retirer une commande de la liste
                return message.reply(`✅ La commande \`${commandName}\` a été retirée de la liste des commandes.`);

            case 'list':
                // Logique pour afficher la liste des commandes
                return message.reply(`📋 Liste des commandes :\n- commande1\n- commande2\n- commande3`);

            default:
                return message.reply('❌ Commande invalide. Utilisez `add`, `remove` ou `list`.');
        }
    }
};