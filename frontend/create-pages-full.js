const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src/app');

const files = {
  'about/page.tsx': `
export default function AboutPage() {
  return (
    <div className="pt-32 pb-20 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-[1440px] mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-black dark:text-white">Our <span className="text-[#C62828]">Story</span></h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-16">
          Aveon Spaces was founded with a singular vision: to revolutionize the modern workspace through ergonomic excellence and uncompromising quality.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-gray-100 dark:bg-white/5 p-10 rounded-3xl border border-black/5 dark:border-white/10">
            <h2 className="text-3xl font-bold font-outfit mb-4 text-black dark:text-white">Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">To craft seating solutions that enhance productivity, support wellbeing, and elevate the aesthetic of every environment.</p>
          </div>
          <div className="bg-gray-100 dark:bg-white/5 p-10 rounded-3xl border border-black/5 dark:border-white/10">
            <h2 className="text-3xl font-bold font-outfit mb-4 text-black dark:text-white">Vision</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">To be the global benchmark in ergonomic design, recognized for sustainable practices and innovative engineering.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  'products/page.tsx': `
export default function ProductsPage() {
  const products = [
    { name: "ErgoPro Executive", cat: "Executive", price: "$450" },
    { name: "Aura Mesh", cat: "Task", price: "$299" },
    { name: "Nova Stool", cat: "Ergonomic", price: "$150" },
    { name: "Zenith Lounge", cat: "Lounge", price: "$850" },
    { name: "Apex Conference", cat: "Conference", price: "$1200" },
    { name: "Lumina Standing Desk", cat: "Desks", price: "$599" },
    { name: "Nimbus Task Chair", cat: "Task", price: "$320" },
    { name: "Vertex Workstation", cat: "Desks", price: "$899" },
    { name: "Oasis Sofa", cat: "Lounge", price: "$1100" }
  ];

  return (
    <div className="pt-32 pb-20 bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-black dark:text-white">Our <span className="text-[#C62828]">Products</span></h1>
        
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 hide-scrollbar">
          {['All', 'Task Chairs', 'Executive', 'Lounge', 'Conference', 'Desks'].map(cat => (
            <button key={cat} className="px-6 py-2 rounded-full border border-black/10 dark:border-white/10 whitespace-nowrap hover:bg-[#C62828] hover:text-white hover:border-[#C62828] transition-colors text-black dark:text-white">
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <div key={i} className="group bg-white dark:bg-white/5 rounded-3xl p-6 border border-black/5 dark:border-white/10 hover:border-[#C62828]/50 hover:shadow-2xl hover:shadow-[#C62828]/10 transition-all cursor-pointer">
              <div className="aspect-square bg-gray-100 dark:bg-white/10 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
                 <span className="text-gray-400 dark:text-gray-600 font-medium font-outfit uppercase tracking-widest text-xs">Product Image</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold font-outfit text-black dark:text-white mb-1 group-hover:text-[#C62828] transition-colors">{p.name}</h3>
                  <span className="text-sm text-gray-500 uppercase tracking-wider font-bold text-[10px]">{p.cat}</span>
                </div>
                <span className="text-lg font-bold text-black dark:text-white">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  'projects/page.tsx': `
export default function ProjectsPage() {
  return (
    <div className="pt-32 pb-20 bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-black dark:text-white">Featured <span className="text-[#C62828]">Projects</span></h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-16">
          Explore how Aveon Spaces has transformed workspaces across industries with bespoke ergonomic solutions.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {[1,2,3,4].map(i => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[16/10] bg-gray-200 dark:bg-white/5 rounded-3xl mb-6 overflow-hidden relative border border-black/5 dark:border-white/10 shadow-lg group-hover:shadow-2xl transition-all">
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-gray-400 dark:text-gray-600 font-medium font-outfit uppercase tracking-widest text-xs">Project Image</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <span className="text-white font-bold bg-[#C62828] px-6 py-3 rounded-full text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">View Case Study</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold font-outfit text-black dark:text-white mb-2 group-hover:text-[#C62828] transition-colors">Tech Hub Workspace {i}</h3>
              <p className="text-gray-500 uppercase tracking-wider text-xs font-bold">Corporate HQ • 500+ Seating Units</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  'solutions/page.tsx': `
export default function SolutionsPage() {
  const solutions = [
    { title: 'Corporate Workspaces', desc: 'We provide specialized ergonomic configurations that meet the rigorous standards and functional requirements of modern corporate workspaces. Our modular designs adapt to changing needs while maintaining aesthetic integrity and employee wellbeing.' },
    { title: 'Educational Institutions', desc: 'Durable, comfortable, and collaborative seating systems designed specifically for modern learning environments. From lecture halls to interactive pods, our solutions foster engagement and focus.' },
    { title: 'Healthcare Facilities', desc: 'Hygienic, supportive, and heavy-duty seating solutions for waiting areas, patient rooms, and administrative staff. Built to withstand 24/7 use while providing essential comfort.' }
  ];

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-[#0A0A0A] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-black dark:text-white">Our <span className="text-[#C62828]">Solutions</span></h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-24">
          Tailored seating and workstation solutions designed for the unique demands of every sector.
        </p>

        <div className="space-y-32">
          {solutions.map((sol, i) => (
            <div key={i} className={\`flex flex-col \${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-24 items-center\`}>
              <div className="flex-1 w-full aspect-[4/3] bg-gray-100 dark:bg-white/5 rounded-[3rem] border border-black/5 dark:border-white/10 relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-gray-400 dark:text-gray-600 font-medium font-outfit uppercase tracking-widest text-xs">Solution Image</span>
                 </div>
              </div>
              <div className="flex-1">
                <div className="w-12 h-1 bg-[#C62828] mb-8"></div>
                <h2 className="text-4xl lg:text-5xl font-bold font-outfit mb-8 text-black dark:text-white leading-tight">{sol.title}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                  {sol.desc}
                </p>
                <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-[#C62828] dark:hover:bg-[#C62828] hover:text-white transition-colors shadow-xl">
                  Explore {sol.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  'contact/page.tsx': `
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-32 pb-20 bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-black dark:text-white">Get in <span className="text-[#C62828]">Touch</span></h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">
              Ready to upgrade your workspace? Our ergonomic experts are here to help you find the perfect solution.
            </p>

            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/10 text-[#C62828] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-[#C62828] group-hover:text-white transition-all">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">Headquarters</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Aveon Spaces<br/>Plot No. 123, Industrial Area<br/>Phase 2, Pune - 411019, India</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/10 text-[#C62828] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-[#C62828] group-hover:text-white transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/10 text-[#C62828] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-[#C62828] group-hover:text-white transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">info@aveonseating.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] p-8 md:p-12 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-2xl">
            <h3 className="text-3xl font-bold font-outfit mb-8 text-black dark:text-white">Send us a message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">First Name</label>
                  <input type="text" className="w-full bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-black dark:text-white focus:outline-none focus:border-[#C62828] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-black dark:text-white focus:outline-none focus:border-[#C62828] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                <input type="email" className="w-full bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-black dark:text-white focus:outline-none focus:border-[#C62828] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-black dark:text-white focus:outline-none focus:border-[#C62828] transition-colors resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#C62828] text-white font-bold rounded-xl px-4 py-4 mt-4 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  'resources/page.tsx': `
import { Download, FileText, Video } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    { icon: FileText, title: "2026 Product Catalog", type: "PDF Document" },
    { icon: Download, title: "ErgoPro Assembly Guide", type: "Manual" },
    { icon: Video, title: "Posture Best Practices", type: "Video Tutorial" },
    { icon: FileText, title: "Workplace Wellbeing Study", type: "Research Paper" },
    { icon: Download, title: "Warranty Information", type: "Document" },
    { icon: Video, title: "Chair Adjustment Guide", type: "Video Tutorial" },
  ];

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-[#0A0A0A] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-black dark:text-white">Knowledge <span className="text-[#C62828]">Center</span></h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-16">
          Access product catalogs, assembly guides, and ergonomic research papers to make the most of your Aveon Spaces.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((res, i) => {
            const Icon = res.icon;
            return (
              <div key={i} className="group bg-gray-50 dark:bg-white/5 rounded-3xl p-8 border border-black/5 dark:border-white/10 hover:border-[#C62828]/50 hover:bg-white dark:hover:bg-[#111111] hover:shadow-2xl transition-all cursor-pointer flex flex-col items-start">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#C62828] group-hover:border-[#C62828] transition-all shadow-sm">
                  <Icon className="w-7 h-7 text-[#C62828] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold font-outfit text-black dark:text-white mb-3 group-hover:text-[#C62828] transition-colors">{res.title}</h3>
                <span className="text-xs uppercase tracking-wider font-bold text-gray-500">{res.type}</span>
                <div className="mt-8 flex items-center gap-2 text-black dark:text-white font-bold text-sm group-hover:text-[#C62828] transition-colors">
                  View Resource
                  <svg className="transform group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
`
};

Object.keys(files).forEach(file => {
  const filePath = path.join(basePath, file);
  fs.writeFileSync(filePath, files[file]);
});

console.log('Successfully fully implemented all pages without nested Navbar/Footer.');
