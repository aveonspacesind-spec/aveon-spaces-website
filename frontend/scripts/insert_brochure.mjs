import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/app/admin/page.tsx', 'utf8');
const insert = `
  // 7. Fetch Global Brochure
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'site_config', 'product_listing'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.globalBrochure !== undefined) setGlobalBrochure(data.globalBrochure);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGlobalBrochureUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setGlobalBrochureError('File size exceeds 10MB limit.'); return; }
    setGlobalBrochureError(''); setGlobalBrochureUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        await setDoc(doc(db, 'site_config', 'product_listing'), { globalBrochure: data.url }, { merge: true });
        setGlobalBrochure(data.url); triggerToast('Global brochure uploaded successfully!');
      } else { setGlobalBrochureError(data.error || 'Failed.'); triggerToast(data.error || 'Upload failed.', 'error'); }
    } catch { setGlobalBrochureError('Network error.'); triggerToast('Network error.', 'error'); }
    finally { setGlobalBrochureUploading(false); }
  };

  const handleRemoveGlobalBrochure = async () => {
    if (!confirm('Remove the global brochure? The Download button will be grayed out for all products.')) return;
    try {
      await setDoc(doc(db, 'site_config', 'product_listing'), { globalBrochure: '' }, { merge: true });
      setGlobalBrochure(''); triggerToast('Global brochure removed.');
    } catch { triggerToast('Failed to remove brochure.', 'error'); }
  };

`;
const marker = '  // Core Actions';
if (content.includes(marker)) {
  const updated = content.replace(marker, insert + marker);
  writeFileSync('src/app/admin/page.tsx', updated, 'utf8');
  console.log('SUCCESS: inserted global brochure handlers');
} else {
  console.log('MARKER NOT FOUND');
  const lines = content.split('\n');
  lines.slice(408, 415).forEach((l, i) => console.log(408 + i, JSON.stringify(l)));
}
