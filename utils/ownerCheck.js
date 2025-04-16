const { ownerId } = require('../config/owner');

function isOwner(userId) {
    return userId === ownerId;
}

function bypassModeration(userId) {
    return userId === ownerId;
}

module.exports = {
    isOwner,
    bypassModeration
};
