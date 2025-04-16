module.exports = {
    owners: [
        '1061373376767201360', // Owner principal
        '985305579297857566',  // Owner secondaire
        '1354712294411468861'  // Owner secondaire
    ],
    isOwner: function(userId) {
        return this.owners.includes(userId);
    }
};
