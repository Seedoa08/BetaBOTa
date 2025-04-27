module.exports = {
    // Niveau 3 - Propriétaire principal (accès total)
    ownerLevel3: ['1061373376767201360'],
    
    // Niveau 2 - Propriétaires secondaires (accès élevé)
    ownerLevel2: ['985305579297857566', '1354712294411468861'],
    
    // Niveau 1 - Administrateurs de confiance (accès limité)
    ownerLevel1: [],

    // Fonctions utilitaires
    isOwner: function(userId) {
        return this.getOwnerLevel(userId) > 0;
    },

    getOwnerLevel: function(userId) {
        if (this.ownerLevel3.includes(userId)) return 3;
        if (this.ownerLevel2.includes(userId)) return 2;
        if (this.ownerLevel1.includes(userId)) return 1;
        return 0;
    },

    canUseCommand: function(userId, requiredLevel) {
        return this.getOwnerLevel(userId) >= requiredLevel;
    }
};
