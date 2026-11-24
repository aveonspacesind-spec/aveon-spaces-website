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
            
            // Replaces text-[#C62828] with text-brand-accent, etc.
            // Also replaces bg-[#C62828] with bg-brand-accent
            // etc.
            
            const regex = /\[#C62828\]/gi;
            if (regex.test(content)) {
                content = content.replace(regex, 'brand-accent');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
            
            // Also replace standalone hex codes if they are bare (e.g. fill="#C62828")
            const hexRegex = /"#C62828"/gi;
            if (hexRegex.test(content)) {
                content = content.replace(hexRegex, '"var(--color-brand-accent)"');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated standalone hex in ${fullPath}`);
            }
        }
    }
}

console.log("Starting replacement in src...");
processDirectory(path.join(__dirname, '..', 'src'));
console.log("Done.");
