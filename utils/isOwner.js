const { ownerLevel3 } = require('../config/owners');

module.exports = function isOwner(userId) {
    return ownerLevel3.includes(userId); // Vérifie si l'utilisateur est un owner de niveau 3
};
