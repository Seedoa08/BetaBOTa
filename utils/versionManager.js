const fs = require('fs');
const path = require('path');

class VersionManager {
    constructor() {
        this.packagePath = path.join(__dirname, '../package.json');
    }

    incrementVersion() {
        try {
            const packageJson = require(this.packagePath);
            const version = packageJson.version;
            const versionParts = version.split('.');

            // Incrémenter la dernière partie de la version
            if (versionParts.length === 2) {
                versionParts.push('0'); // Ajouter .0 si pas de troisième numéro
            }
            versionParts[2] = (parseInt(versionParts[2]) + 1).toString();

            // Mettre à jour package.json
            packageJson.version = versionParts.join('.');
            fs.writeFileSync(this.packagePath, JSON.stringify(packageJson, null, 4));

            return packageJson.version;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la version:', error);
            return '1.1.0';
        }
    }

    getCurrentVersion() {
        try {
            const packageJson = require(this.packagePath);
            return packageJson.version;
        } catch {
            return '1.1.0';
        }
    }
}

module.exports = new VersionManager();
