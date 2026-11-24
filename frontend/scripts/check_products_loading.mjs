import { readFileSync } from 'fs';
const content = readFileSync('src/app/admin/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('productsLoading')) console.log(i+1, l.trim().substring(0,100));
});
