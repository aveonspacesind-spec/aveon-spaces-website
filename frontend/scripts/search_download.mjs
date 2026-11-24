import { readFileSync } from 'fs';
const content = readFileSync('src/app/products/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.toLowerCase().includes('download') || line.toLowerCase().includes('brochure')) {
    console.log(i+1, line.trim().substring(0, 120));
  }
});
