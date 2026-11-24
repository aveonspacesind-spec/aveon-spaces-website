import { readFileSync, writeFileSync } from 'fs';
let content = readFileSync('src/app/products/page.tsx', 'utf8');
const oldModal = `                  {selectedProduct.brochure ? (
                    <a 
                      href={selectedProduct.brochure}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                      <Download className="w-4 h-4" /> Brochure
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="px-6 py-4 bg-white/5 border border-white/5 text-white/20 rounded-full font-black uppercase tracking-widest text-[10px] cursor-not-allowed flex items-center justify-center gap-2 opacity-50"
                      title="Brochure Unavailable"
                    >
                      <Download className="w-4 h-4" /> Brochure N/A
                    </button>
                  )}`;

const newModal = `                  {globalBrochure ? (
                    <a 
                      href={globalBrochure}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                      <Download className="w-4 h-4" /> Brochure
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="px-6 py-4 bg-white/5 border border-white/5 text-white/20 rounded-full font-black uppercase tracking-widest text-[10px] cursor-not-allowed flex items-center justify-center gap-2 opacity-50"
                      title="Brochure Unavailable"
                    >
                      <Download className="w-4 h-4" /> Brochure N/A
                    </button>
                  )}`;

if (content.includes('selectedProduct.brochure')) {
  content = content.replace(oldModal, newModal);
  writeFileSync('src/app/products/page.tsx', content, 'utf8');
  console.log('SUCCESS: updated quick-view modal brochure button');
} else {
  console.log('Target not found - checking...');
  const idx = content.indexOf('selectedProduct.brochure');
  console.log('selectedProduct.brochure at idx:', idx);
}
