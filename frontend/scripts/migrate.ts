import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBq5hhigvk66TTfcki3uMBS4q6MW7bolvg",
  authDomain: "aveon-spaces.firebaseapp.com",
  projectId: "aveon-spaces",
  storageBucket: "aveon-spaces.firebasestorage.app",
  messagingSenderId: "732759868979",
  appId: "1:732759868979:web:1bcedcfbefe92b79560546",
  measurementId: "G-LLBECQDYHC"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const fallbackProducts = {
  "aeromesh-pro-executive": {
    id: "aeromesh-pro-executive",
    name: "AeroMesh Pro Executive",
    category: "Executive Seating",
    description: "The AeroMesh Pro redefines executive comfort with its adaptive lumbar support system and breathable tension-mesh back. Engineered for 24/7 intensive use environments, it seamlessly blends industrial durability with premium corporate aesthetics.",
    tagline: "Ergonomic brilliance that moves with you.",
    price: "Request Quote",
    colors: [
      { name: "Space Black", hex: "#111111" },
      { name: "Cloud Grey", hex: "#E5E7EB" },
      { name: "Olive Green", hex: "#556b2f" }
    ],
    features: [
      "Adaptive 3D Lumbar Support",
      "Breathable High-Tension Mesh",
      "Synchronized Tilt Mechanism",
      "4D Adjustable Armrests",
      "Polished Aluminum Base"
    ],
    highlightedFeatures: [
      { icon: "Shield", title: "Ergonomic Support" },
      { icon: "Star", title: "Premium Materials" },
      { icon: "CheckCircle", title: "12 Year Warranty" }
    ],
    hotspots: [
      { title: "2D Adjustable Headrest", description: "Provides personalized neck support to reduce strain during long hours.", top: "15", left: "50" },
      { title: "Adaptive Lumbar Support", description: "Dynamically adjusts to your spine's natural curve.", top: "60", left: "50" },
      { title: "4D Armrests", description: "Fully adjustable armrests to perfectly align with your desk height.", top: "50", left: "80" },
      { title: "Breathable Mesh", description: "Maintains optimal temperature and comfort all day.", top: "40", left: "50" }
    ],
    detailedFeatures: [
      { icon: "LayoutGrid", title: "Dynamic Lumbar Support", description: "Automatically adjusts to your spine's natural curve, providing constant lower back support." },
      { icon: "Move", title: "Synchro-Tilt Mechanism", description: "Maintains proper ergonomic alignment as you recline, keeping your feet flat on the floor." },
      { icon: "Wind", title: "Breathable Mesh Back", description: "High-tension, elastomer mesh promotes air circulation to keep you cool and comfortable." },
      { icon: "Minimize2", title: "Adjustable Seat Depth", description: "Allows you to fine-tune the seat pan for optimal thigh support and blood flow." }
    ],
    storyBlock: {
      title: "Designed Around You",
      description: "Aeronix adapts to your body's micro-movements, ensuring perfect posture and comfort throughout your longest days. It's not just a chair; it's a precision instrument for your productivity.",
      videoUrl: "#",
      image: ""
    },
    materials: [
      { title: "Premium Mesh", description: "High-tension elastomeric mesh for breathability and support.", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80" },
      { title: "Moulded Foam", description: "High-density polyurethane foam seat cushion that retains shape.", image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80" },
      { title: "Aluminium Base", description: "Polished recycled aluminum 5-star base for maximum stability.", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80" },
      { title: "PU Casters", description: "Smooth-rolling 60mm casters safe for all floor types.", image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80" }
    ],
    specs: {
      "Overall Height": '44" - 48"',
      "Seat Width": '21.5"',
      "Seat Depth": '19" - 21.5"',
      "Weight Capacity": "350 lbs",
      "Warranty": "12 Years Limited",
      "Materials": "Recycled Aluminum, Premium Mesh, Polyurethane"
    },
    images: [
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80"
    ]
  },
  "ergopro-executive": {
    id: "ergopro-executive",
    name: "ErgoPro Executive",
    category: "Executive Seating",
    description: "The ErgoPro Executive is designed for ultimate posture control, featuring a genuine leather high-back and high-density memory foam padding. Perfect for boardroom leadership and high-focus executive environments.",
    price: "Request Quote",
    features: [
      "High-Back Premium Leather",
      "Memory Foam Seat Cushion",
      "Tilt Lock & Tension Tension Tuning",
      "3D Padded Armrests",
      "Polished Chrome Base"
    ],
    specs: {
      "Overall Height": '45" - 49"',
      "Seat Width": '22"',
      "Seat Depth": '20" - 22"',
      "Weight Capacity": "375 lbs",
      "Warranty": "10 Years Limited",
      "Materials": "Premium Leather, Aluminum, High-Density Foam"
    },
    images: [
      "",
      "",
      "",
      ""
    ]
  },
  "aura-mesh-task": {
    id: "aura-mesh-task",
    name: "Aura Mesh Task",
    category: "Task Seating",
    description: "The Aura Mesh Task offers sleek minimalist design combined with light-weight, highly supportive polymers. Its self-weight adjusting mechanism makes it ideal for flexible desking and co-working environments.",
    price: "Request Quote",
    features: [
      "Weight-Activated Auto Tilt",
      "Breathable Elastomeric Mesh",
      "Sleek Polyurethane Frame",
      "Height Adjustable Armrests",
      "Reinforced Nylon Base"
    ],
    specs: {
      "Overall Height": '38" - 42"',
      "Seat Width": '19.5"',
      "Seat Depth": '18"',
      "Weight Capacity": "300 lbs",
      "Warranty": "5 Years Limited",
      "Materials": "Polymer Frame, Elastomeric Mesh"
    },
    images: [
      "",
      "",
      "",
      ""
    ]
  },
  "strata-conference": {
    id: "strata-conference",
    name: "Strata Conference",
    category: "Conference Seating",
    description: "The Strata Conference chair provides immediate comfort with zero adjustments needed. Its responsive ribbed back shell moves with the user, perfect for collaborative spaces and meeting rooms.",
    price: "Request Quote",
    features: [
      "Responsive Ribbed Shell",
      "Fixed Aluminum Armrests",
      "Auto-Return Swivel Cylinder",
      "Low-Profile 4-Star Base",
      "Premium Fabric Upholstery"
    ],
    specs: {
      "Overall Height": '36"',
      "Seat Width": '20"',
      "Seat Depth": '18.5"',
      "Weight Capacity": "275 lbs",
      "Warranty": "5 Years Limited",
      "Materials": "Aluminum Base, Polypropylene Shell, Fabric"
    },
    images: [
      "",
      "",
      "",
      ""
    ]
  },
  "luna-lounge": {
    id: "luna-lounge",
    name: "Luna Lounge",
    category: "Lounge Seating",
    description: "Create inviting reception and breakout areas with the Luna Lounge. Its organic curves and deep cushioning offer a relaxing sanctuary in the modern open-plan office.",
    price: "Request Quote",
    features: [
      "Organic Sculpted Design",
      "Deep Coil-Spring Cushioning",
      "Solid Ash Wood Legs",
      "Commercial-Grade Wool Blend",
      "Acoustic Dampening Properties"
    ],
    specs: {
      "Overall Height": '32"',
      "Seat Width": '28"',
      "Seat Depth": '24"',
      "Weight Capacity": "400 lbs",
      "Warranty": "7 Years Limited",
      "Materials": "Solid Ash Wood, Wool-Blend Upholstery, High-Resilience Foam"
    },
    images: [
      "",
      "",
      "",
      ""
    ]
  }
};

async function migrate() {
  try {
    let count = 0;
    const productsRef = collection(db, 'products');
    for (const [key, product] of Object.entries(fallbackProducts)) {
      await setDoc(doc(productsRef, key), product);
      console.log(`Migrated ${key}`);
      count++;
    }
    console.log(`Successfully migrated ${count} products.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
