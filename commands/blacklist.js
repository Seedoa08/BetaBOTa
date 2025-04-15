const { ownerId } = require('../config/owner');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'blacklist',
    description: 'Gère la liste noire des utilisateurs bannis du bot',
    usage: '+blacklist <add/remove/list> <userID>',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée au propriétaire du bot.');
        }

        const blacklistPath = path.join(__dirname, '../data/blacklist.json');
        let blacklist = { users: [] };
        
        if (fs.existsSync(blacklistPath)) {
            blacklist = JSON.parse(fs.readFileSync(blacklistPath));
        }

        const action = args[0]?.toLowerCase();
        const userId = args[1];

        switch (action) {
            case 'add':
                if (!userId) return message.reply('❌ Veuillez fournir un ID utilisateur.');
                if (userId === ownerId) return message.reply('❌ Vous ne pouvez pas blacklist l\'owner.');
                
                if (!blacklist.users.includes(userId)) {
                    blacklist.users.push(userId);
                    fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
                    message.reply(`✅ Utilisateur ${userId} ajouté à la blacklist.`);
                } else {
                    message.reply('❌ Cet utilisateur est déjà blacklisté.');
                }
                break;

            case 'remove':
                if (!userId) return message.reply('❌ Veuillez fournir un ID utilisateur.');
                
                const index = blacklist.users.indexOf(userId);
                if (index > -1) {
                    blacklist.users.splice(index, 1);
                    fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
                    message.reply(`✅ Utilisateur ${userId} retiré de la blacklist.`);
                } else {
                    message.reply('❌ Cet utilisateur n\'est pas dans la blacklist.');
                }
                break;

            case 'list':
                if (blacklist.users.length === 0) {
                    return message.reply('📋 La blacklist est vide.');
                }
                
                const embed = {
                    color: 0xff0000,
                    title: '📋 Liste des utilisateurs blacklistés',
                    description: blacklist.users.join('\n'),
                    timestamp: new Date()
                };
                
                message.channel.send({ embeds: [embed] });
                break;

            default:
                message.reply('❌ Action invalide. Utilisez `add`, `remove` ou `list`.');
        }
    }
};
