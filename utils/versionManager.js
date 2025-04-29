const fs = require('fs');
const path = require('path');

function incrementVersion() {
    const packagePath = path.join(__dirname, '../package.json');
    const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    let [major, minor, patch] = package.version.split('.').map(Number);
    
    // Incrémenter la version
    patch++;
    if (patch > 9) {
        patch = 0;
        minor++;
        if (minor > 9) {
            minor = 0;
            major++;
        }
    }
    
    const newVersion = `${major}.${minor}.${patch}`;
    package.version = newVersion;
    
    // Sauvegarder la nouvelle version
    fs.writeFileSync(packagePath, JSON.stringify(package, null, 4));
    
    return newVersion;
}

module.exports = { incrementVersion };
