module.exports = {
    enabled: true,
    logChannel: 'mod-logs', // nom du canal pour les logs de modération
    actions: {
        hate: 'mute',
        spam: 'warn',
        nsfw: 'delete',
        threat: 'ban'
    },
    thresholds: {
        toxicity: 0.8,
        spam: 0.9,
        nsfw: 0.8,
        threat: 0.7
    },
    muteDuration: '1h',
    ignoredChannels: [], // IDs des canaux à ignorer
    ignoredRoles: [], // IDs des rôles à ignorer
    warnBeforeAction: true,
    wordlist: {
        insults: {
            french: [
                // Insultes françaises
                "connard", "connasse", "pute", "salope", "batard", "fdp", "ntm", "tg", "ta gueule",
                "enculé", "enculer", "merde", "bite", "pd", "nique", "niquer", "putain"
            ],
            english: [
                // Common English insults
                "fuck", "fucking", "bitch", "asshole", "cunt", "dick", "pussy", "whore", "slut",
                "retard", "idiot", "bastard", "motherfucker", "stfu", "kys", "kys", "gtfo",
                // Racist/Discriminatory terms
                "nigger", "nigga", "faggot", "fag", "dyke", "tranny",
                // Mild insults
                "moron", "stupid", "dumb", "idiot", "trash"
            ],
            variations: [
                // Common variations to bypass filters
                "f4ck", "b!tch", "sh!t", "fvck", "n1gga", "b1tch",
                "!d!ot", "tr4sh", "d1ck", "p*ssy", "wh0re"
            ]
        },
        spam: [
            // Discord invites and links
            "discord.gg/", "https://", "http://", "www.",
            // Repeated characters
            "!!!", "???", "...", "___",
            // Common spam patterns
            "@everyone", "@here"
        ],
        punishments: {
            FIRST_OFFENSE: "warn",
            SECOND_OFFENSE: "mute_1h",
            THIRD_OFFENSE: "mute_12h",
            FOURTH_OFFENSE: "ban"
        },
        thresholds: {
            CAPS_PERCENTAGE: 70,
            MAX_REPEATED_CHARS: 4,
            MAX_MESSAGE_LENGTH: 1000,
            EMOJI_LIMIT: 6,
            MENTION_LIMIT: 3,
            SIMILAR_MESSAGES_INTERVAL: 10
        }
    }
};
