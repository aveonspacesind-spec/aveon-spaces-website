import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/app/admin/page.tsx', 'utf8');

const productListingTab = `
            {/* PRODUCT LISTING CMS TAB */}
            {activeTab === 'productListing' && (
              <motion.div
                key="productListing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight">PRODUCT LISTING CMS</h2>
                  <p className="text-gray-400 text-xs mt-1">Manage global brochure and product listing page content.</p>
                </div>

                {/* Global Brochure Card */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Global Product Brochure</h3>
                      <p className="text-xs text-gray-400 mt-1">This single PDF is shared as the download link across all product pages. Upload once, applies everywhere.</p>
                    </div>
                    {globalBrochure && (
                      <button
                        type="button"
                        onClick={handleRemoveGlobalBrochure}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" /> Remove Brochure
                      </button>
                    )}
                  </div>

                  <div className="relative group w-full bg-black/30 rounded-2xl border border-white/10 hover:border-white/20 transition-all p-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Status Indicator */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-white/10 bg-black flex-shrink-0 flex flex-col items-center justify-center gap-2">
                      {globalBrochure ? (
                        <>
                          <FileText className="w-10 h-10 text-emerald-400" />
                          <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">Loaded</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-10 h-10 text-white/15" />
                          <span className="text-[8px] font-black uppercase text-white/20 tracking-wider">Empty</span>
                        </>
                      )}
                      {globalBrochureUploading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                          <RefreshCw className="w-6 h-6 text-[#C62828] animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      {globalBrochure ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Brochure Active</span>
                          </div>
                          <p className="text-xs text-white/60 font-medium truncate max-w-[360px]">{globalBrochure.split('/').pop()}</p>
                          <a
                            href={globalBrochure}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[10px] text-[#C62828] font-bold uppercase tracking-wider hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview PDF
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-600" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Brochure Uploaded</span>
                          </div>
                          <p className="text-xs text-white/30 leading-relaxed">Upload a PDF brochure (max 10MB). The Download button on all product pages will be active once uploaded.</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                          type="button"
                          disabled={globalBrochureUploading}
                          onClick={() => globalBrochureInputRef.current?.click()}
                          className="px-6 py-3.5 bg-[#C62828] hover:bg-[#a82222] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#C62828]/20"
                        >
                          <Upload className="w-4 h-4" />
                          {globalBrochureUploading ? 'Uploading...' : globalBrochure ? 'Replace Brochure' : 'Upload Brochure PDF'}
                        </button>
                        <input
                          type="file"
                          ref={globalBrochureInputRef}
                          onChange={handleGlobalBrochureUpload}
                          accept=".pdf,application/pdf"
                          className="hidden"
                        />
                      </div>

                      {globalBrochureError && (
                        <div className="text-[10px] font-bold text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{globalBrochureError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className={\`flex items-center gap-4 p-4 rounded-2xl border \${globalBrochure ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}\`}>
                    {globalBrochure ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <p className="text-xs font-bold text-gray-300">
                      {globalBrochure
                        ? 'The Download Brochure button is active on all product pages. Visitors can download the PDF.'
                        : 'No global brochure uploaded. The Download Brochure button will be grayed-out and disabled on all product pages.'}
                    </p>
                  </div>
                </div>

                {/* Products Quick Overview */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Products Overview</h3>
                    <p className="text-xs text-gray-400 mt-1">Quick-access to toggle featured status for products. For full edits, use the Products Catalog tab.</p>
                  </div>
                  {productsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-sm border border-white/5 border-dashed rounded-2xl">
                      No products found. Add products in the Products Catalog tab.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {products.map((prod) => (
                        <div key={prod.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate">{prod.name}</h4>
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{prod.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Featured</span>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const { doc: firestoreDoc, updateDoc: firestoreUpdate } = await import('firebase/firestore');
                                  await firestoreUpdate(firestoreDoc(db, 'products', prod.id), { isFeatured: !prod.isFeatured });
                                  triggerToast(\`\${prod.name} \${!prod.isFeatured ? 'added to' : 'removed from'} featured showcase\`);
                                } catch { triggerToast('Failed to update featured status', 'error'); }
                              }}
                              className={\`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${prod.isFeatured ? 'bg-[#C62828]' : 'bg-white/10 hover:bg-white/20'}\`}
                            >
                              <span className={\`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${prod.isFeatured ? 'translate-x-5' : 'translate-x-0'}\`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

`;

const marker = '            {/* ENQUIRIES TAB */}';
if (content.includes(marker)) {
  const updated = content.replace(marker, productListingTab + marker);
  writeFileSync('src/app/admin/page.tsx', updated, 'utf8');
  console.log('SUCCESS: inserted Product Listing CMS tab');
} else {
  console.log('MARKER NOT FOUND');
  // Show lines around where it should be
  const lines = content.split('\n');
  const idx = lines.findIndex(l => l.includes('ENQUIRIES TAB'));
  if (idx > -1) {
    console.log('Found at line', idx);
    lines.slice(Math.max(0,idx-2), idx+3).forEach((l,i) => console.log(idx-2+i, JSON.stringify(l)));
  }
}
