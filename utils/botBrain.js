const fs = require('fs');
const path = require('path');
const isOwner = require('./ownerCheck');

class BotBrain {
    constructor() {
        // Création du dossier data s'il n'existe pas
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.learningPath = path.join(dataDir, 'learning.json');
        this.contextPath = path.join(dataDir, 'context.json');
        this.patternPath = path.join(dataDir, 'patterns.json');
        
        // Création des fichiers s'ils n'existent pas
        const defaultData = { patterns: {}, responses: {}, keywords: {} };
        
        if (!fs.existsSync(this.learningPath)) {
            fs.writeFileSync(this.learningPath, JSON.stringify(defaultData, null, 2));
        }
        if (!fs.existsSync(this.contextPath)) {
            fs.writeFileSync(this.contextPath, JSON.stringify({}, null, 2));
        }
        if (!fs.existsSync(this.patternPath)) {
            fs.writeFileSync(this.patternPath, JSON.stringify({}, null, 2));
        }
        
        // Initialisation des systèmes
        this.learning = this.loadData(this.learningPath);
        this.context = this.loadData(this.contextPath);
        this.patterns = this.loadData(this.patternPath);
        
        // Système d'auto-apprentissage
        this.spamPatterns = new Map();
        this.userBehavior = new Map();
        this.messagePatterns = new Map();
    }

    loadData(filePath) {
        try {
            return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
        } catch (error) {
            console.error(`Erreur lors du chargement des données: ${error}`);
            return {};
        }
    }

    saveData(data, filePath) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Erreur lors de la sauvegarde des données: ${error}`);
        }
    }

    learn(message) {
        const content = message.content.toLowerCase();
        const guildId = message.guild.id;
        
        if (!this.learning[guildId]) {
            this.learning[guildId] = {
                patterns: {},
                responses: {},
                keywords: {}
            };
        }

        // Apprentissage des mots clés et patterns
        const words = content.split(/\s+/);
        words.forEach(word => {
            if (!this.learning[guildId].keywords[word]) {
                this.learning[guildId].keywords[word] = 0;
            }
            this.learning[guildId].keywords[word]++;
        });

        this.saveData(this.learning, this.learningPath);
    }

    analyzeContext(message) {
        const guildId = message.guild.id;
        if (!this.context[guildId]) {
            this.context[guildId] = {
                mood: 'neutral',
                lastInteraction: Date.now(),
                messageCount: 0,
                userInteractions: {}
            };
        }

        // Analyse du contexte
        const content = message.content.toLowerCase();
        const ctx = this.context[guildId];
        ctx.messageCount++;
        
        // Analyse de l'humeur basée sur les mots
        if (content.match(/merci|super|génial|cool/)) ctx.mood = 'happy';
        if (content.match(/bug|erreur|problème/)) ctx.mood = 'concerned';
        if (content.match(/aide|help|sos/)) ctx.mood = 'helpful';

        // Suivi des interactions utilisateur
        if (!ctx.userInteractions[message.author.id]) {
            ctx.userInteractions[message.author.id] = 0;
        }
        ctx.userInteractions[message.author.id]++;

        this.saveData(this.context, this.contextPath);
        return ctx;
    }

    generateResponse(message) {
        const ctx = this.analyzeContext(message);
        const content = message.content.toLowerCase();

        // Génération de réponse contextuelle
        let response = {
            content: null,
            mood: ctx.mood,
            confidence: 0
        };

        // Réponses basées sur l'humeur
        switch (ctx.mood) {
            case 'happy':
                response.content = "Je suis content que tout se passe bien ! 😊";
                break;
            case 'concerned':
                response.content = "Je peux peut-être vous aider avec ce problème ? 🤔";
                break;
            case 'helpful':
                response.content = "Je suis là pour vous aider ! Que puis-je faire ? 💪";
                break;
        }

        return response;
    }

    async autoModerate(message) {
        // Protection de l'owner
        if (isOwner(message.author.id)) {
            return;
        }

        const content = message.content.toLowerCase();
        const userId = message.author.id;
        const guildId = message.guild.id;

        // Analyse comportementale
        this.updateUserBehavior(userId, message);
        
        // Détection de patterns suspects
        const patterns = this.detectPatterns(content);
        
        // Score de risque
        const riskScore = this.calculateRiskScore(message);

        // Actions automatiques basées sur le score
        if (riskScore > 80) {
            await this.handleHighRisk(message);
        } else if (riskScore > 50) {
            await this.handleMediumRisk(message);
        }

        // Apprentissage du pattern
        this.learnPattern(content, riskScore);
    }

    updateUserBehavior(userId, message) {
        if (!this.userBehavior.has(userId)) {
            this.userBehavior.set(userId, {
                messageCount: 0,
                warningCount: 0,
                patterns: [],
                lastMessages: []
            });
        }

        const behavior = this.userBehavior.get(userId);
        behavior.messageCount++;
        behavior.lastMessages.push({
            content: message.content,
            timestamp: Date.now()
        });

        // Garder seulement les 10 derniers messages
        if (behavior.lastMessages.length > 10) {
            behavior.lastMessages.shift();
        }
    }

    detectPatterns(content) {
        const patterns = {
            spam: this.detectSpamPattern(content),
            caps: content.toUpperCase() === content && content.length > 10,
            links: content.match(/https?:\/\/[^\s]+/g)?.length || 0,
            mentions: content.match(/<@!?\d+>/g)?.length || 0,
            repeatedChars: this.detectRepeatedChars(content)
        };

        return patterns;
    }

    calculateRiskScore(message) {
        let score = 0;
        const patterns = this.detectPatterns(message.content);
        const behavior = this.userBehavior.get(message.author.id);

        // Facteurs de score
        if (patterns.spam) score += 30;
        if (patterns.caps) score += 10;
        if (patterns.links > 3) score += 20;
        if (patterns.mentions > 5) score += 25;
        if (patterns.repeatedChars) score += 15;
        if (behavior?.warningCount > 2) score += 25;

        return score;
    }

    async handleHighRisk(message) {
        try {
            await message.delete();
            const userId = message.author.id;
            const behavior = this.userBehavior.get(userId);
            behavior.warningCount++;

            if (behavior.warningCount >= 3) {
                // Mute automatique
                const member = message.member;
                if (member && member.moderatable) {
                    await member.timeout(300000, 'Auto-modération: Comportement à haut risque');
                }
            }

            // Log l'action
            this.logAutoMod({
                type: 'high_risk',
                userId: userId,
                messageContent: message.content,
                action: 'delete_and_timeout'
            });
        } catch (error) {
            console.error('Erreur dans handleHighRisk:', error);
        }
    }

    detectSpamPattern(content) {
        // Détection de spam basée sur la répétition et la vitesse
        const repeatedWords = content.split(' ').filter((word, index, array) => 
            array.indexOf(word) !== index
        ).length;

        return repeatedWords > 5;
    }

    detectRepeatedChars(content) {
        // Détection de caractères répétés (ex: "aaaaaa")
        return /(.)\1{4,}/.test(content);
    }

    learnPattern(content, riskScore) {
        // Apprentissage des nouveaux patterns
        const words = content.toLowerCase().split(/\s+/);
        
        words.forEach(word => {
            if (!this.patterns[word]) {
                this.patterns[word] = {
                    riskScore: 0,
                    occurrences: 0
                };
            }

            this.patterns[word].occurrences++;
            this.patterns[word].riskScore = (this.patterns[word].riskScore + riskScore) / 2;
        });

        // Sauvegarder les nouveaux patterns
        this.saveData(this.patterns, this.patternPath);
    }

    logAutoMod(data) {
        const logPath = path.join(__dirname, '../logs/automod.json');
        const logs = this.loadData(logPath);
        
        logs.push({
            ...data,
            timestamp: new Date().toISOString()
        });

        this.saveData(logs, logPath);
    }

    async analyzeUserBehavior(message) {
        const userId = message.author.id;
        
        // Protection de l'owner
        if (isOwner(userId)) {
            return {
                messageCount: 0,
                warningCount: 0,
                patterns: [],
                toxicityScore: 0,
                lastMessages: [],
                recentInfractions: [],
                trustScore: 100
            };
        }

        const behavior = this.userBehavior.get(userId) || {
            messageCount: 0,
            warningCount: 0,
            patterns: [],
            toxicityScore: 0,
            lastMessages: [],
            recentInfractions: [],
            trustScore: 100
        };

        // Analyse du message
        const messageScore = await this.analyzeToxicity(message.content);
        behavior.toxicityScore = (behavior.toxicityScore * 0.8) + (messageScore * 0.2);
        behavior.trustScore = Math.max(0, behavior.trustScore - (messageScore > 0.7 ? 10 : 0));

        // Détection de comportement suspect
        if (this.isSpamming(behavior.lastMessages)) {
            behavior.trustScore -= 5;
            behavior.recentInfractions.push({
                type: 'spam',
                timestamp: Date.now()
            });
        }

        // Système de réhabilitation
        if (behavior.trustScore < 50) {
            await this.handleLowTrustUser(message, behavior);
        }

        this.userBehavior.set(userId, behavior);
        return behavior;
    }

    async analyzeToxicity(content) {
        // Analyse de toxicité basée sur les patterns appris
        let toxicityScore = 0;
        const words = content.toLowerCase().split(/\s+/);
        
        words.forEach(word => {
            if (this.patterns[word]) {
                toxicityScore += this.patterns[word].riskScore / this.patterns[word].occurrences;
            }
        });

        return Math.min(1, toxicityScore);
    }

    async handleLowTrustUser(message, behavior) {
        const actions = {
            warning: behavior.trustScore < 50,
            timeout: behavior.trustScore < 30,
            ban: behavior.trustScore < 10
        };

        if (actions.ban) {
            await this.recommendBan(message);
        } else if (actions.timeout) {
            await this.autoTimeout(message);
        } else if (actions.warning) {
            await this.sendWarning(message);
        }
    }

    async autoTimeout(message) {
        const member = message.member;
        if (!member || !member.moderatable) return;

        const timeouts = {
            first: 5 * 60 * 1000,    // 5 minutes
            second: 15 * 60 * 1000,  // 15 minutes
            third: 60 * 60 * 1000,   // 1 heure
            fourth: 24 * 60 * 60 * 1000 // 24 heures
        };

        const behavior = this.userBehavior.get(member.id);
        const duration = timeouts[Object.keys(timeouts)[Math.min(behavior.warningCount, 3)]] || timeouts.fourth;

        await member.timeout(duration, 'Comportement inapproprié détecté par l\'auto-modération');
        
        const embed = {
            color: 0xFF0000,
            title: '🤖 Auto-Modération',
            description: `${member.user.tag} a été automatiquement mute pour comportement inapproprié.`,
            fields: [
                { name: 'Durée', value: `${duration / 60000} minutes`, inline: true },
                { name: 'Trust Score', value: `${behavior.trustScore}/100`, inline: true }
            ],
            timestamp: new Date()
        };

        await message.channel.send({ embeds: [embed] });
    }

    async recommendBan(message) {
        const behavior = this.userBehavior.get(message.author.id);
        const embed = {
            color: 0xFF0000,
            title: '⚠️ Recommandation de bannissement',
            description: `L'utilisateur ${message.author.tag} présente un comportement très toxique.`,
            fields: [
                { name: 'Trust Score', value: `${behavior.trustScore}/100`, inline: true },
                { name: 'Infractions', value: `${behavior.recentInfractions.length}`, inline: true },
                { name: 'Comportement', value: this.generateBehaviorReport(behavior) }
            ],
            timestamp: new Date()
        };

        // Trouver un canal de logs de modération
        const modChannel = message.guild.channels.cache.find(c => 
            c.name.includes('mod-logs') || c.name.includes('moderation')
        );

        if (modChannel) {
            await modChannel.send({ embeds: [embed] });
        }
    }

    generateBehaviorReport(behavior) {
        const warnings = behavior.recentInfractions
            .slice(-5)
            .map(inf => `- ${inf.type} (${new Date(inf.timestamp).toLocaleString()})`)
            .join('\n');

        return `Dernières infractions:\n${warnings || "Aucune infraction récente"}`;
    }

    isSpamming(messages) {
        if (messages.length < 3) return false;

        const recentMessages = messages.filter(msg => 
            Date.now() - msg.timestamp < 5000 // Messages des 5 dernières secondes
        );

        if (recentMessages.length >= 5) return true; // Plus de 5 messages en 5 secondes

        // Vérifier les messages similaires
        const content = messages.map(m => m.content);
        const uniqueMessages = new Set(content);
        return uniqueMessages.size < content.length * 0.5; // Plus de 50% de messages similaires
    }

    async analyzeMessage(message) {
        const content = message.content.toLowerCase();
        const result = {
            shouldAct: false,
            toxicity: 0,
            spamScore: 0,
            patterns: [],
            action: null
        };

        // Analyse du contenu
        const toxicityScore = await this.analyzeToxicity(content);
        const patterns = this.detectPatterns(content);
        const behavior = this.userBehavior.get(message.author.id);

        result.toxicity = toxicityScore;
        result.patterns = patterns;
        result.spamScore = this.isSpamming(behavior?.lastMessages || []) ? 1 : 0;

        // Déterminer si une action est nécessaire
        if (toxicityScore > 0.7 || result.spamScore > 0.8 || patterns.spam) {
            result.shouldAct = true;
            result.action = this.determineAction(toxicityScore, result.spamScore, patterns);
        }

        return result;
    }

    determineAction(toxicity, spamScore, patterns) {
        if (toxicity > 0.9 || spamScore > 0.9) {
            return 'timeout';
        } else if (patterns.spam || patterns.repeatedChars) {
            return 'delete';
        } else if (toxicity > 0.7 || spamScore > 0.7) {
            return 'warn';
        }
        return 'monitor';
    }

    async handleViolation(message, analysis) {
        switch (analysis.action) {
            case 'timeout':
                await this.handleHighRisk(message);
                break;
            case 'delete':
                await message.delete().catch(console.error);
                await this.sendWarning(message);
                break;
            case 'warn':
                await this.sendWarning(message);
                break;
            case 'monitor':
                this.logAutoMod({
                    type: 'monitor',
                    userId: message.author.id,
                    messageContent: message.content,
                    analysis: analysis
                });
                break;
        }
    }

    async sendWarning(message) {
        const warningEmbed = {
            color: 0xFFAA00,
            title: '⚠️ Avertissement',
            description: 'Votre comportement a été détecté comme potentiellement inapproprié.',
            footer: {
                text: 'Auto-modération',
                icon_url: message.client.user.displayAvatarURL()
            },
            timestamp: new Date()
        };

        try {
            const warningMsg = await message.channel.send({ embeds: [warningEmbed] });
            setTimeout(() => warningMsg.delete().catch(console.error), 5000);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'avertissement:', error);
        }
    }
}

module.exports = BotBrain;
