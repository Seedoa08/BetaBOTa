const fs = require('fs');
const authorizedUsersFile = './authorizedUsers.json';

module.exports = {
    name: 'owneronly',
    description: 'Commande réservée à l\'owner du bot pour gérer les utilisateurs autorisés.',
    usage: '+owneronly <add/remove/list> [@utilisateur]',
    permissions: 'OwnerOnly',
    variables: [
        { name: 'add', description: 'Ajoute un utilisateur à la liste des autorisés' },
        { name: 'remove', description: 'Retire un utilisateur de la liste des autorisés' },
        { name: 'list', description: 'Affiche la liste des utilisateurs autorisés' }
    ],
    async execute(message, args) {
        const ownerId = '1061373376767201360';

        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        try {
            // Initialiser le fichier avec un tableau vide s'il n'existe pas
            if (!fs.existsSync(authorizedUsersFile)) {
                fs.writeFileSync(authorizedUsersFile, JSON.stringify({ users: [] }, null, 4));
            }

            // Charger la liste des utilisateurs autorisés
            let data = JSON.parse(fs.readFileSync(authorizedUsersFile, 'utf8'));
            if (!data.users) data.users = []; // S'assurer que users est un tableau

            const subCommand = args[0]?.toLowerCase();
            const targetUser = message.mentions.users.first();

            switch (subCommand) {
                case 'add':
                    if (!targetUser) {
                        return message.reply('❌ Vous devez mentionner un utilisateur. Exemple: `+owneronly add @utilisateur`');
                    }
                    if (data.users.includes(targetUser.id)) {
                        return message.reply('❌ Cet utilisateur est déjà dans la liste des autorisés.');
                    }
                    data.users.push(targetUser.id);
                    fs.writeFileSync(authorizedUsersFile, JSON.stringify(data, null, 4));
                    return message.reply(`✅ ${targetUser.tag} a été ajouté à la liste des utilisateurs autorisés.`);

                case 'remove':
                    if (!targetUser) {
                        return message.reply('❌ Vous devez mentionner un utilisateur. Exemple: `+owneronly remove @utilisateur`');
                    }
                    if (!data.users.includes(targetUser.id)) {
                        return message.reply('❌ Cet utilisateur n\'est pas dans la liste des autorisés.');
                    }
                    data.users = data.users.filter(id => id !== targetUser.id);
                    fs.writeFileSync(authorizedUsersFile, JSON.stringify(data, null, 4));
                    return message.reply(`✅ ${targetUser.tag} a été retiré de la liste des utilisateurs autorisés.`);

                case 'list':
                    if (data.users.length === 0) {
                        return message.reply('📋 La liste des utilisateurs autorisés est vide.');
                    }
                    const userList = await Promise.all(
                        data.users.map(async (id) => {
                            try {
                                const user = await message.client.users.fetch(id);
                                return `- ${user.tag} (${id})`;
                            } catch {
                                return `- ID invalide: ${id}`;
                            }
                        })
                    );
                    return message.reply(`📋 Liste des utilisateurs autorisés :\n${userList.join('\n')}`);

                default:
                    return message.reply('❌ Commande invalide. Utilisez `add`, `remove` ou `list`.');
            }
        } catch (error) {
            console.error('Erreur dans la commande owneronly:', error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};
