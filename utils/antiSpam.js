class AntiSpam {
    constructor() {
        this.messageCache = new Map();
        this.warnThreshold = 5;  // Messages similaires
        this.muteThreshold = 8;  // Messages similaires
    }

    check(message) {
        const oneMinute = 60000;
        const userId = message.author.id;
        const now = Date.now();
        
        if (!this.messageCache.has(userId)) {
            this.messageCache.set(userId, []);
        }

        const userMessages = this.messageCache.get(userId);
        userMessages.push({
            content: message.content,
            timestamp: now
        });

        // Nettoyer les messages plus vieux qu'une minute
        const recentMessages = userMessages.filter(msg => now - msg.timestamp < oneMinute);
        this.messageCache.set(userId, recentMessages);

        return {
            shouldWarn: recentMessages.length >= this.warnThreshold,
            shouldMute: recentMessages.length >= this.muteThreshold
        };
    }
}

module.exports = new AntiSpam();
