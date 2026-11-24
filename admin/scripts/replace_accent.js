const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            const regex = /\[#C62828\]/gi;
            if (regex.test(content)) {
                content = content.replace(regex, 'brand-accent');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
            
            const hexRegex = /"#C62828"/gi;
            if (hexRegex.test(content)) {
                content = content.replace(hexRegex, '"var(--color-brand-accent)"');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated standalone hex in ${fullPath}`);
            }
        }
    }
}

console.log("Starting replacement in admin src...");
processDirectory(path.join(__dirname, '..', 'src'));
console.log("Done.");
