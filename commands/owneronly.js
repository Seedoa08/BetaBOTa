const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const ownersPath = path.join(__dirname, '../utils/owners.json');

module.exports = {
    name: 'owneronly',
    description: 'Gère les permissions des owners',
    usage: '+owneronly <add/remove/list/level> [@utilisateur] [niveau]',
    category: 'Admin',
    ownerOnly: true,
    async execute(message, args) {
        const owners = JSON.parse(fs.readFileSync(ownersPath, 'utf8'));
        
        // Vérifier le niveau de l'auteur de la commande
        const authorLevel = Object.entries(owners.levels)
            .find(([level, ids]) => ids.includes(message.author.id))?.[0] ?? 0;

        if (authorLevel < 3) {
            return message.reply('❌ Seuls les owners niveau 3 peuvent utiliser cette commande.');
        }

        const subCommand = args[0]?.toLowerCase();
        const mentionedUser = message.mentions.users.first();
        const level = parseInt(args[2]);

        if (!['add', 'remove', 'list', 'level'].includes(subCommand)) {
            return message.reply('❌ Usage: `+owneronly <add/remove/list/level> [@utilisateur] [niveau]`');
        }

        switch (subCommand) {
            case 'add':
                if (!mentionedUser || !level || ![1, 2, 3].includes(level)) {
                    return message.reply('❌ Usage: `+owneronly add @utilisateur <1-3>`');
                }
                
                // Vérifier si l'utilisateur est déjà owner
                const currentLevel = Object.entries(owners.levels)
                    .find(([_, ids]) => ids.includes(mentionedUser.id))?.[0];
                
                if (currentLevel) {
                    return message.reply(`❌ Cet utilisateur est déjà owner niveau ${currentLevel}`);
                }

                owners.levels[level].push(mentionedUser.id);
                break;

            case 'remove':
                if (!mentionedUser) {
                    return message.reply('❌ Vous devez mentionner un utilisateur');
                }

                let removed = false;
                for (const level in owners.levels) {
                    const index = owners.levels[level].indexOf(mentionedUser.id);
                    if (index !== -1) {
                        owners.levels[level].splice(index, 1);
                        removed = true;
                        break;
                    }
                }

                if (!removed) {
                    return message.reply('❌ Cet utilisateur n\'est pas owner');
                }
                break;

            case 'list':
                const embed = {
                    color: 0x0099ff,
                    title: '👑 Liste des Owners',
                    fields: Object.entries(owners.levels).map(([level, ids]) => ({
                        name: `Niveau ${level} - ${owners.descriptions[level]}`,
                        value: ids.length ? ids.map(id => `<@${id}>`).join('\n') : 'Aucun owner'
                    })),
                    footer: { text: 'Owner System v2.0' },
                    timestamp: new Date()
                };
                return message.reply({ embeds: [embed] });

            case 'level':
                if (!mentionedUser) {
                    return message.reply('❌ Vous devez mentionner un utilisateur');
                }
                
                const userLevel = Object.entries(owners.levels)
                    .find(([_, ids]) => ids.includes(mentionedUser.id))?.[0] ?? 'Aucun';
                
                return message.reply(`👑 ${mentionedUser.tag} est owner niveau ${userLevel}`);
        }

        // Sauvegarder les modifications
        fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 4));
        message.reply('✅ La liste des owners a été mise à jour.');
    }
};
