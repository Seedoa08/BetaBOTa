const { ownerLevel3, ownerLevel2, ownerLevel1 } = require('../config/owners');

function isOwner(userId) {
    return [
        ...ownerLevel3,
        ...ownerLevel2,
        ...ownerLevel1
    ].includes(userId);
}

module.exports = isOwner;
