const fs = require('fs');
const { PermissionsBitField } = require('discord.js');
const authorizedUsersFile = './authorizedUsers.json';

function isAuthorized(userId) {
    try {
        if (!fs.existsSync(authorizedUsersFile)) {
            fs.writeFileSync(authorizedUsersFile, JSON.stringify({ users: [] }, null, 4));
            return false;
        }
        const data = JSON.parse(fs.readFileSync(authorizedUsersFile, 'utf8'));
        return data.users?.includes(userId) || false;
    } catch (error) {
        console.error('Erreur lors de la vérification des autorisations:', error);
        return false;
    }
}

function checkPermissions(message, requiredPermission) {
    // Vérifier si c'est l'owner ou un utilisateur autorisé
    if (message.author.id === '1061373376767201360' || isAuthorized(message.author.id)) {
        return true;
    }

    // Vérifier les permissions Discord
    if (requiredPermission) {
        return message.member.permissions.has(PermissionsBitField.Flags[requiredPermission]);
    }

    return true;
}

module.exports = { isAuthorized, checkPermissions };
