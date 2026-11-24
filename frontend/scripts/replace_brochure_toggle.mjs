import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/app/admin/page.tsx', 'utf8');

// 1. Replace checkbox-based isFeatured with a proper toggle switch in the product form
const oldFeaturedCheckbox = `                      <div className="space-y-1 flex items-center justify-center pt-5">
                        <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={productForm.isFeatured} 
                            onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                            className="w-5 h-5 accent-[#C62828] rounded border-white/10 bg-[#111]"
                          />
                          Feature on Homepage?
                        </label>
                      </div>`;

const newFeaturedToggle = `                      <div className="flex items-center justify-between bg-black/30 border border-white/5 px-4 py-3 rounded-2xl">
                        <div>
                          <p className="text-sm font-bold text-white">Feature on Homepage</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Show in featured showcase</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={\`text-[10px] font-black uppercase tracking-widest \${productForm.isFeatured ? 'text-green-400' : 'text-white/30'}\`}>
                            {productForm.isFeatured ? 'On' : 'Off'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, isFeatured: !productForm.isFeatured })}
                            className={\`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${productForm.isFeatured ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20'}\`}
                          >
                            <span className={\`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${productForm.isFeatured ? 'translate-x-5' : 'translate-x-0'}\`} />
                          </button>
                        </div>
                      </div>`;

if (content.includes(oldFeaturedCheckbox)) {
  content = content.replace(oldFeaturedCheckbox, newFeaturedToggle);
  console.log('SUCCESS: Replaced isFeatured checkbox with toggle switch');
} else {
  console.log('WARNING: isFeatured checkbox not found - searching for partial match...');
  // Try to find the block
  const idx = content.indexOf('Feature on Homepage?');
  if (idx > -1) console.log('Found "Feature on Homepage?" at index', idx, '| char:', content.substring(idx-300, idx+100));
  else console.log('Not found at all');
}

// 2. Replace the per-product brochure upload button in the product card list view
// with a simple indicator that brochure is global
const oldCardBrochure = `                          <div className="text-[10px] text-gray-500 font-bold flex flex-col gap-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span className={\`w-1.5 h-1.5 rounded-full \${prod.brochure ? 'bg-green-500' : 'bg-gray-600'}\`} />
                                {prod.brochure ? 'Brochure PDF' : 'No Brochure PDF'}
                              </span>
                              {prod.brochure && (
                                <a href={prod.brochure} target="_blank" rel="noopener noreferrer" className="text-[#C62828] hover:underline font-bold text-[9px] uppercase tracking-wider">
                                  View PDF
                                </a>
                              )}
                            </div>
                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl py-2 px-3 text-center text-[9px] font-black uppercase tracking-wider transition-all block">
                              {directUploadingProductId === prod.id ? 'Uploading...' : prod.brochure ? 'Replace Brochure' : 'Upload Brochure PDF'}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                disabled={directUploadingProductId === prod.id}
                                onChange={(e) => handleDirectBrochureUpload(prod.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>`;

const newCardBrochureIndicator = `                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold pt-1">
                            <span className={\`w-1.5 h-1.5 rounded-full \${globalBrochure ? 'bg-green-500' : 'bg-gray-600'}\`} />
                            <span>{globalBrochure ? 'Global Brochure Active' : 'No Brochure (Global)'}</span>
                          </div>`;

if (content.includes('directUploadingProductId === prod.id')) {
  // Find and replace the full block
  const startIdx = content.indexOf(`                          <div className="text-[10px] text-gray-500 font-bold flex flex-col gap-2 pt-1">`);
  const endMarker = `                          </div>\n\n                        </div>\n\n                        <div className="flex items-center gap-3 pt-3 border-t border-white/5 justify-end">`;
  const endIdx = content.indexOf(endMarker);
  if (startIdx > -1 && endIdx > -1 && endIdx > startIdx) {
    content = content.substring(0, startIdx) + newCardBrochureIndicator + '\n' + content.substring(endIdx);
    console.log('SUCCESS: Replaced per-product brochure card buttons with global indicator');
  } else {
    console.log('Could not find card brochure block bounds. startIdx:', startIdx, 'endIdx:', endIdx);
  }
} else {
  console.log('Per-product upload card button not found');
}

// 3. Remove per-product brochure in the edit form (keep the form clean - no per-product brochure)
// Replace the brochure section in the edit product form with a note about global brochure
const oldFormBrochure = `                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brochure PDF</label>`;

const newFormBrochureNote = `                      <div className="md:col-span-2 flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                        <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-blue-300">Brochure is Global</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">The brochure PDF is shared across all products. Manage it in the <span className="text-[#C62828] font-bold">Product Listing CMS</span> tab.</p>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2 hidden">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brochure PDF</label>`;

if (content.includes(oldFormBrochure)) {
  content = content.replace(oldFormBrochure, newFormBrochureNote);
  console.log('SUCCESS: Added global brochure note to product form, hidden old brochure section start');
  // Now we need to close the hidden div - find where the old brochure block ends
  // The old block ends right before </div> </div> -> the form grid closing
  // We need to add a closing </div> after the hidden section
  // Let's find and replace the closing of that block
  const hiddenBlockEnd = `                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-2">`;
  const newHiddenBlockEnd = `                          </div>
                        </div>
                      </div>
                      </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-2">`;
  if (content.includes(hiddenBlockEnd)) {
    content = content.replace(hiddenBlockEnd, newHiddenBlockEnd);
    console.log('SUCCESS: Closed hidden brochure section');
  } else {
    console.log('WARNING: Could not find hidden block closing for brochure section');
  }
} else {
  console.log('WARNING: Old form brochure section not found');
}

writeFileSync('src/app/admin/page.tsx', content, 'utf8');
console.log('All replacements complete. File saved.');
