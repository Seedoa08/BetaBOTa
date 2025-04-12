const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

class AutoModerator {
    static wordlist = {
        insults: [
            // Insultes graves
            "pute", "salope", "fdp", "ntm", "enculé",
            "connard", "connasse", "sale pute", "grosse pute",
            "nique ta", "nike ta", "suce ma", "ta mere la",
            
            // Insultes discriminatoires graves
            "negro", "negre", "nègre", "sale noir", "sale arabe",
            "sale juif", "nigger", "nigga",

            // Variantes codées
            "n1ke", "n1qu3", "p.ute", "s4l0pe", "fdpp",
            "nik ta", "nique ta", "suc3", "s4le",
            
            // Insultes anglaises graves
            "motherfucker", "son of a bitch", "fucking whore",
            "kys", "kill yourself"
        ],

        spam: [
            // Liens et invitations
            "discord.gg/", "discord.com/invite", "dsc.gg", 
            ".gg/", "invite.gg", "discord.io",
            
            // Publicités malveillantes
            "free nitro", "nitro gratuit", "steam cards free",
            "robux generator", "vbucks free", "coin generator",
            "hack discord", "token grab", "password gen",
            
            // Scam commun
            "gift from steam", "claim your prize", "you won",
            "double your", "crypto offer", "bitcoin generator",
            "money glitch", "fast money", "easy money",
            
            // Domaines suspects
            "grabify", "iplogger", "2no.co", "yip.su", 
            "iplis", "02ip", "ezstat", "blasze",
            
            // Réseaux sociaux
            "linktr.ee/", "allmylinks", "instagram.com/p/",
            "tiktok.com/@", "twitter.com/", "t.me/",
            
            // Phrases suspectes
            "check my bio", "link in profile", "selling cheap",
            "real no fake", "instant delivery", "tap here",
            "click fast", "limited time", "only today"
        ],

        toxicity: [
            // Menaces physiques
            "je vais te tuer", "je te retrouve", "je sais où tu",
            "ton adresse", "chez toi", "te faire la peau",
            "te casser la gueule", "te défoncer", "te faire mal",
            
            // Menaces en ligne
            "ddos", "dos attack", "ip grab", "token grab",
            "hack ton compte", "leaks", "expose", "raid",
            
            // Intimidation grave
            "suicide toi", "va mourir", "tue toi",
            "want you dead", "kill yourself", "end your life",
            
            // Extrémisme
            "terrorisme", "attentat", "tuerie", "massacre",
            "shooting", "bomb", "tuerie de masse",
            "school threat", "end them all"
        ],

        // Nouveau: Patterns de spam
        spamPatterns: {
            caps: 0.7,           // 70% majuscules max
            repetition: 3,       // 3 répétitions max du même caractère
            mentions: 3,         // 3 mentions max par message
            emojis: 5,          // 5 émojis max par message
            lines: 10           // 10 lignes max par message
        }
    };

    static async analyze(message) {
        const content = message.content.toLowerCase();
        let severity = 0;
        let reasons = [];

        // Vérifier le contenu pour les insultes
        for (const word of this.wordlist.insults) {
            if (content.includes(word)) {
                severity += 1;
                reasons.push('Langage inapproprié');
                break;
            }
        }

        // Vérifier pour le spam
        for (const pattern of this.wordlist.spam) {
            if (content.includes(pattern)) {
                severity += 2;
                reasons.push('Spam détecté');
            }
        }

        // Nouvelle détection de spam améliorée
        if (this.checkSpamPatterns(message)) {
            severity += 1;
            reasons.push('Spam pattern détecté');
        }

        // Vérifier la toxicité
        for (const toxic of this.wordlist.toxicity) {
            if (content.includes(toxic)) {
                severity += 3;
                reasons.push('Contenu toxique');
                break;
            }
        }

        if (severity > 0) {
            return {
                flagged: true,
                reason: reasons.join(', '),
                action: this.determineAction(severity),
                severity: severity
            };
        }

        return null;
    }

    static determineAction(severity) {
        if (severity >= 5) return { action: 'ban', duration: null };
        if (severity >= 3) return { action: 'mute', duration: '6h' };
        if (severity >= 2) return { action: 'mute', duration: '1h' };
        return { action: 'warn', duration: null };
    }

    static checkSpamPatterns(message) {
        const content = message.content;
        const patterns = this.wordlist.spamPatterns;
        let spamScore = 0;

        // Vérification plus précise des majuscules
        const upperCount = content.replace(/[^A-Z]/g, '').length;
        const totalCount = content.replace(/[^A-Za-z]/g, '').length;
        if (totalCount > 10 && upperCount / totalCount > patterns.caps) {
            spamScore += 1;
        }

        // Vérification des messages similaires récents
        const recentMessages = message.channel.messages.cache
            .filter(m => m.author.id === message.author.id)
            .filter(m => Date.now() - m.createdTimestamp < 10000); // 10 secondes

        if (recentMessages.size >= 5) {
            spamScore += 2;
        }

        // Vérification des mentions multiples
        if (message.mentions.users.size + message.mentions.roles.size > patterns.mentions) {
            spamScore += message.mentions.users.size > 5 ? 2 : 1;
        }

        // Vérification des liens suspects
        const suspiciousLinks = content.match(/(https?:\/\/[^\s]+)/g) || [];
        if (suspiciousLinks.length > 2) {
            spamScore += 2;
        }

        return spamScore >= 2;
    }

    static async handleSpam(message, severity) {
        const action = this.determineAction(severity);
        const member = message.member;

        if (!member) return;

        try {
            switch (action.action) {
                case 'ban':
                    if (member.bannable) {
                        await member.ban({ reason: 'AutoMod: Spam excessif' });
                    }
                    break;
                case 'mute':
                    if (member.moderatable) {
                        const duration = ms(action.duration);
                        await member.timeout(duration, 'AutoMod: Spam détecté');
                    }
                    break;
                case 'warn':
                    // Utiliser le système d'avertissement existant
                    const warns = this.getWarns(member.id) || [];
                    warns.push({
                        date: Date.now(),
                        reason: 'AutoMod: Spam',
                        severity: severity
                    });
                    this.saveWarns(member.id, warns);
                    break;
            }

            // Suppression des messages de spam
            const messages = await message.channel.messages.fetch({ 
                limit: 20,
                before: message.id 
            });
            
            const spamMessages = messages.filter(m => 
                m.author.id === message.author.id && 
                Date.now() - m.createdTimestamp < 30000
            );

            if (spamMessages.size > 0) {
                message.channel.bulkDelete(spamMessages);
            }

        } catch (error) {
            console.error('Erreur lors de la gestion du spam:', error);
        }
    }

    // Nouvelle méthode pour gérer la persistance des avertissements
    static getWarns(userId) {
        const warnsFile = './warnings.json';
        if (!fs.existsSync(warnsFile)) return [];
        const warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
        return warns[userId] || [];
    }

    static saveWarns(userId, warns) {
        const warnsFile = './warnings.json';
        const allWarns = fs.existsSync(warnsFile) ? 
            JSON.parse(fs.readFileSync(warnsFile, 'utf8')) : {};
        
        allWarns[userId] = warns;
        fs.writeFileSync(warnsFile, JSON.stringify(allWarns, null, 2));
    }
}

module.exports = AutoModerator;
