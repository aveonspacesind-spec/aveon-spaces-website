const fs = require('fs');
const path = require('path');

const files = [
  'app/testimonials/page.tsx',
  'app/solutions/page.tsx',
  'app/reviews/page.tsx',
  'app/projects/page.tsx',
  'app/products/page.tsx',
  'app/orders/page.tsx',
  'app/newsletter/page.tsx',
  'app/media/page.tsx',
  'app/insights/page.tsx',
  'app/categories/page.tsx',
  'app/capabilities/page.tsx',
  'components/ProductForm.tsx',
  'app/stats/page.tsx',
  'app/settings/products/page.tsx',
  'app/settings/page.tsx',
  'app/contact/page.tsx',
  'app/about/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join('E:/WebDev Projects/Aveon Seating System/admin/src', file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (content.includes('alert(') || content.includes('window.confirm(') || content.includes('confirm(')) {
    // Add imports
    if (!content.includes('react-hot-toast')) {
      content = content.replace(/(import .*? from ['"].*?['"];\n)/, `$1import toast from "react-hot-toast";\n`);
    }
    if ((content.includes('window.confirm(') || content.includes('confirm(')) && !content.includes('ConfirmProvider')) {
      content = content.replace(/(import .*? from ['"].*?['"];\n)/, `$1import { useConfirm } from "@/components/ConfirmProvider";\n`);
    }

    // Add const confirm = useConfirm(); inside the default export component
    if (content.includes('useConfirm') && !content.includes('const confirm = useConfirm()')) {
      content = content.replace(/export default function (.*?) {/, `export default function $1 {\n  const confirm = useConfirm();`);
    }

    // Replace alert("... success ...") with toast.success
    content = content.replace(/alert\((['"`])(.*?success.*?)\1\)/gi, 'toast.success($1$2$1)');
    // Replace alert("... saved ...") with toast.success
    content = content.replace(/alert\((['"`])(.*?saved.*?)\1\)/gi, 'toast.success($1$2$1)');
    // Replace alert("...") with toast.error for anything else
    content = content.replace(/alert\(/g, 'toast.error(');

    // Replace confirm("...") with await confirm({ message: "..." })
    // We assume the handler is async (most are).
    content = content.replace(/(!)?window\.confirm\((['"`])(.*?)\2\)/g, '$1await confirm({ message: $2$3$2 })');
    content = content.replace(/(!)?confirm\((['"`])(.*?)\2\)/g, '$1await confirm({ message: $2$3$2 })');
    
    fs.writeFileSync(fullPath, content);
    console.log("Updated: " + file);
  }
});
