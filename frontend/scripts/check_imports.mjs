import { readFileSync } from 'fs';
const content = readFileSync('src/app/admin/page.tsx', 'utf8');
const lines = content.split('\n');
// Find all imports
lines.forEach((line, i) => {
  if (i < 30 && line.includes('import')) {
    console.log(i+1, line.trim().substring(0, 120));
  }
});
// Check for setDoc
const setDocIdx = content.indexOf('setDoc');
console.log('setDoc appears at:', setDocIdx > -1 ? 'yes, line~' + content.substring(0, setDocIdx).split('\n').length : 'NOT FOUND');
// Check for FileText
const fileTextIdx = content.indexOf('FileText');
console.log('FileText import:', fileTextIdx > -1 ? 'yes' : 'NOT FOUND');
// Check for RefreshCw
const rcwIdx = content.indexOf('RefreshCw');
console.log('RefreshCw import:', rcwIdx > -1 ? 'yes' : 'NOT FOUND');
// Check for CheckCircle
const ccIdx = content.indexOf('CheckCircle');
console.log('CheckCircle import:', ccIdx > -1 ? 'yes' : 'NOT FOUND');
// Check for AlertCircle
const acIdx = content.indexOf('AlertCircle');
console.log('AlertCircle import:', acIdx > -1 ? 'yes' : 'NOT FOUND');
// Check for Upload
const upIdx = content.indexOf('Upload');
console.log('Upload import:', upIdx > -1 ? 'yes' : 'NOT FOUND');
// Check for Eye
const eyeIdx = content.indexOf('Eye');
console.log('Eye import:', eyeIdx > -1 ? 'yes' : 'NOT FOUND');
// Check for useRef
const urIdx = content.indexOf('useRef');
console.log('useRef usage:', urIdx > -1 ? 'yes' : 'NOT FOUND');
