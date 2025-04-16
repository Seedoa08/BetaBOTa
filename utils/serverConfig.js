const fs = require('fs');
const path = require('path');

class ServerConfig {
    constructor() {
        this.configPath = path.join(__dirname, '../data/serverConfigs.json');
        this.configs = this.loadConfigs();
    }

    loadConfigs() {
        if (!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, JSON.stringify({}, null, 2));
            return {};
        }
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }

    getConfig(guildId) {
        if (!this.configs[guildId]) {
            this.configs[guildId] = {
                antiRaid: false,
                automod: false,
                muteRole: null,
                logChannel: null,
                prefix: '+',
                warnThreshold: 3,
                maxMentions: 5,
                maxEmojis: 10,
                maxLines: 10
            };
            this.saveConfigs();
        }
        return this.configs[guildId];
    }

    updateConfig(guildId, settings) {
        this.configs[guildId] = {
            ...this.getConfig(guildId),
            ...settings
        };
        this.saveConfigs();
    }

    saveConfigs() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
    }
}

module.exports = new ServerConfig();
