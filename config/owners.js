module.exports = {
    ownerLevel3: ['1061373376767201360'], // ID du propriétaire principal
    ownerLevel2: ['985305579297857566', '1354712294411468861'], // IDs des propriétaires secondaires
    ownerLevel1: [], // IDs des administrateurs de confiance

    // Fonction pour obtenir le niveau d'un utilisateur
    getOwnerLevel(userId) {
        if (this.ownerLevel3.includes(userId)) return 3;
        if (this.ownerLevel2.includes(userId)) return 2;
        if (this.ownerLevel1.includes(userId)) return 1;
        return 0; // Pas un owner
    }
};
