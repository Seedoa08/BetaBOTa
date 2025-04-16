const RaidDefense = require('../utils/RaidDefense');
const raidDefense = new RaidDefense();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Vérification anti-raid
        const canJoin = await raidDefense.processJoin(member);
        if (!canJoin) return;

        // Vérification supplémentaire
        const suspiciousPatterns = [
            /discord\.gg\//i,
            /discord\.com\/invite/i,
            /nitro/i
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(member.user.username))) {
            await member.guild.channels.cache
                .find(ch => ch.name === 'mod-logs')
                ?.send({
                    embeds: [{
                        color: 0xff0000,
                        title: '⚠️ Membre suspect détecté',
                        description: `Nom d'utilisateur suspect: ${member.user.tag}`,
                        timestamp: new Date()
                    }]
                });
        }
    }
};
