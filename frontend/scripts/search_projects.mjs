import { readFileSync } from 'fs';
const content = readFileSync('src/app/admin/page.tsx', 'utf8');
// Find all lines mentioning Project Showcase or projects tab
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('Project') && (line.includes('Showcase') || line.includes('showcase') || line.includes('featured') || line.includes('projects'))) {
    console.log(i+1, JSON.stringify(line.trim().substring(0,120)));
  }
});
