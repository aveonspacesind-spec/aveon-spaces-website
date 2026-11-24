const fs = require('fs');
const path = require('path');

const pages = [
  { dir: 'projects', title: 'Our Projects' },
  { dir: 'about', title: 'About Us' },
  { dir: 'resources', title: 'Resources' },
  { dir: 'contact', title: 'Contact Us' },
  { dir: 'products', title: 'Our Products' },
  { dir: 'solutions', title: 'Solutions' },
];

const template = (title) => `import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#C62828] rounded-full mix-blend-screen filter blur-[100px] md:blur-[150px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
            Under Construction
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-outfit tracking-tighter mb-6 capitalize">
            ${title}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
            We are meticulously crafting the <strong className="text-white font-normal">${title}</strong> experience. Please check back soon for updates.
          </p>
          <a href="/" className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-full hover:bg-[#C62828] hover:border-[#C62828] hover:text-white transition-all duration-300 shadow-xl">
            Return to Home
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}`;

const basePath = path.join(__dirname, 'src/app');

pages.forEach(page => {
  const dirPath = path.join(basePath, page.dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), template(page.title));
});

console.log('Pages created successfully.');
