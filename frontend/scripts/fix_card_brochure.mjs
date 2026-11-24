import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/app/admin/page.tsx', 'utf8');

// Find card brochure section by searching for "directUploadingProductId"
const directUploadIdx = content.indexOf('directUploadingProductId === prod.id');
if (directUploadIdx > -1) {
  // Find the start of the containing div (go back to find the opening div)
  const before = content.substring(0, directUploadIdx);
  const divStart = before.lastIndexOf('<div className="text-[10px] text-gray-500 font-bold flex flex-col gap-2 pt-1">');
  
  if (divStart > -1) {
    // Find the end - the closing </div> of this block (after the input for brochure upload)
    // The block contains a label+input and ends with </div>
    const afterDivStart = content.substring(divStart);
    
    // Count nested divs to find the matching closing tag
    let depth = 0;
    let pos = 0;
    let endPos = -1;
    while (pos < afterDivStart.length) {
      if (afterDivStart.startsWith('<div', pos)) {
        depth++;
        pos += 4;
      } else if (afterDivStart.startsWith('</div>', pos)) {
        depth--;
        if (depth === 0) {
          endPos = pos + 6; // length of </div>
          break;
        }
        pos += 6;
      } else {
        pos++;
      }
    }
    
    if (endPos > -1) {
      const fullBlock = afterDivStart.substring(0, endPos);
      const replacement = `<div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold pt-1">
                            <span className={\`w-1.5 h-1.5 rounded-full \${globalBrochure ? 'bg-green-500' : 'bg-gray-600'}\`} />
                            <span>{globalBrochure ? 'Global Brochure Active' : 'No Global Brochure'}</span>
                          </div>`;
      content = content.substring(0, divStart) + replacement + content.substring(divStart + endPos);
      console.log('SUCCESS: Replaced per-product card brochure section');
    } else {
      console.log('Could not find end of card brochure div');
    }
  } else {
    console.log('Could not find start of card brochure div');
  }
} else {
  console.log('directUploadingProductId not found - already removed?');
}

writeFileSync('src/app/admin/page.tsx', content, 'utf8');
console.log('Done.');
