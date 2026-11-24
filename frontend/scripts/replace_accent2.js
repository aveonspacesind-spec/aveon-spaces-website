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
            let updated = false;

            const redRegex = /red-(500|700|800)/g;
            if (redRegex.test(content)) {
                content = content.replace(redRegex, 'brand-accent');
                updated = true;
            }

            const rgbaRegex = /rgba\(\s*198\s*,\s*40\s*,\s*40\s*,\s*([0-9.]+)\s*\)/g;
            if (rgbaRegex.test(content)) {
                content = content.replace(rgbaRegex, (match, p1) => {
                    const percent = Math.round(parseFloat(p1) * 100);
                    return `color-mix(in srgb, var(--color-brand-accent) ${percent}%, transparent)`;
                });
                updated = true;
            }

            const hexRegex = /\[#9b1f1f\]/gi;
            if (hexRegex.test(content)) {
                content = content.replace(hexRegex, 'brand-primary');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

console.log("Starting replacement 2 in frontend src...");
processDirectory(path.join(__dirname, '..', 'src'));
console.log("Done.");
