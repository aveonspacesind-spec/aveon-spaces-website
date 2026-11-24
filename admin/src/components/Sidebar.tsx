"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { 
  Home, 
  Package, 
  FolderTree, 
  MessageSquare, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sliders,
  Folder,
  Quote,
  Info,
  Wrench,
  BookOpen,
  Layers,
  BarChart,
  Database,
  ChevronDown,
  Mail,
  ShoppingBag,
  Layout,
  Users,
  Star,
  Activity,
  FileText,
  PieChart,
  Bell,
  Shield,
  History,
  Globe,
  Search,
  Save,
  Key,
  Tag,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MenuItem = {
  name: string;
  icon: any;
  href?: string;
  items?: { name: string; icon: any; href: string }[];
};

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false); // Default to extended

  const menuGroups: MenuItem[] = [
    { name: "Dashboard", icon: Home, href: "/" },
    {
      name: "Website",
      icon: Globe,
      items: [
        { name: "Homepage CMS", icon: Home, href: "/settings" },
        { name: "Projects", icon: Folder, href: "/projects" },
        { name: "Testimonials", icon: Quote, href: "/testimonials" },
        { name: "Team CMS", icon: Users, href: "/team" },
        { name: "Impact Stats", icon: BarChart, href: "/stats" },
        { name: "Insights / Blog", icon: BookOpen, href: "/insights" },
        { name: "Contact Details", icon: Settings, href: "/contact" },
        { name: "Media Library", icon: ImageIcon, href: "/media" }
      ]
    },
    {
      name: "Orders",
      icon: ShoppingBag,
      items: [
        { name: "All Orders", icon: ShoppingBag, href: "/orders" },
        { name: "New Orders", icon: Bell, href: "/orders?filter=Pending" },
        { name: "Processing", icon: Activity, href: "/orders?filter=In%20Progress" },
        { name: "Completed", icon: Star, href: "/orders?filter=Completed" },
        { name: "Cancelled", icon: History, href: "/orders?filter=Cancelled" }
      ]
    },
    {
      name: "Customers",
      icon: Users,
      items: [
        { name: "Contact Messages", icon: MessageSquare, href: "/orders?view=contact" },
        { name: "Product Enquiries", icon: ShoppingBag, href: "/orders?view=orders" },
        { name: "Newsletter", icon: Mail, href: "/newsletter" },
        { name: "Reviews", icon: Star, href: "/reviews" }
      ]
    },
    {
      name: "Catalog",
      icon: Layers,
      items: [
        { name: "Products", icon: Package, href: "/products" },
        { name: "Categories", icon: FolderTree, href: "/categories" }
      ]
    },
    {
      name: "Users (Future Scope)",
      icon: Users,
      items: [
        { name: "Administrators", icon: Shield, href: "#" },
        { name: "Roles & Permissions", icon: Key, href: "#" },
        { name: "Activity Logs", icon: History, href: "#" }
      ]
    },
    {
      name: "Settings",
      icon: Settings,
      items: [
        { name: "Homepage Settings", icon: Home, href: "/settings" },
        { name: "System Utilities", icon: Wrench, href: "/system-utilities" }
      ]
    }
  ];

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Website": true,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      if (prev[groupName]) {
        return {}; // Close all if clicking the already open one
      }
      return { [groupName]: true }; // Open this one and close others
    });
  };

  const isItemActive = (href: string) => {
    if (href === "#") return false;
    const [path, query] = href.split("?");
    if (path !== pathname) return false;
    
    if (query) {
      const hrefParams = new URLSearchParams(query);
      for (const [key, value] of hrefParams.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    }
    
    if (!query && searchParams.toString().length > 0) {
      return false; 
    }

    return pathname === href;
  };

  // Auto-expand group that contains active item
  useEffect(() => {
    if (isCollapsed) return;
    
    let activeGroupName = null;
    
    menuGroups.forEach(group => {
      if (group.items) {
        const hasActiveChild = group.items.some(item => isItemActive(item.href));
        if (hasActiveChild) {
          activeGroupName = group.name;
        }
      }
    });
    
    if (activeGroupName && !expandedGroups[activeGroupName]) {
      setExpandedGroups({ [activeGroupName]: true });
    }
  }, [pathname, searchParams, isCollapsed]);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 110 : 320 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0A0A0A] border-r border-white/5 h-full flex flex-col shadow-2xl z-[100] relative overflow-visible shrink-0"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-10 -right-4 w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center z-[110] shadow-xl shadow-brand-accent/40 hover:scale-110 transition-all border-4 border-[#0A0A0A] cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
 
      <div className="flex flex-col h-full relative overflow-hidden">
 
      <div className={`flex items-center justify-center transition-all duration-500 ${isCollapsed ? 'p-4 mt-4' : 'p-8'}`}>
        <div className="flex items-center gap-3">
          <div className={`${isCollapsed ? 'w-12 h-12 rounded-full' : 'min-w-[48px] h-12 rounded-2xl'} bg-brand-accent flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-brand-accent/20 transition-all duration-500`}>
            A
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-semibold tracking-normal text-white whitespace-nowrap"
              >
                AVEON <span className="text-brand-accent">Admin</span>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <nav className="flex-1 px-6 space-y-4 overflow-y-auto scrollbar-none pr-2 pb-4">
        {isCollapsed ? (
          // Flat list of icons when collapsed
          <div className="space-y-3">
            {menuGroups.flatMap(group => 
              group.items ? group.items.map(item => ({ ...item, uniqueKey: `${group.name}-${item.name}` })) 
                          : [{ ...group, uniqueKey: group.name, href: group.href! }]
            ).map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link 
                  key={item.uniqueKey}
                  href={item.href} 
                  className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-300 relative group ${
                    isActive 
                      ? "bg-white/5 text-white shadow-xl border border-white/5" 
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${isActive ? "text-brand-accent drop-shadow-[0_0_8px_color-mix(in srgb, var(--color-brand-accent) 50%, transparent)]" : "text-white/20 group-hover:text-white"}`} />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-brand-accent text-white text-[11px] font-semibold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-2xl shadow-brand-accent/40 whitespace-nowrap z-[300]">
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-brand-accent rotate-45" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // Grouped expandable accordion layout
          menuGroups.map((group) => {
            if (group.href) {
              const isActive = isItemActive(group.href);
              return (
                <Link
                  key={group.name}
                  href={group.href}
                  className={`flex items-center gap-3 p-3.5 mb-1 text-[12px] font-semibold rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-white/5 text-brand-accent border border-white/5 shadow-xl shadow-brand-accent/5"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <group.icon className={`w-4 h-4 ${isActive ? "text-brand-accent drop-shadow-[0_0_6px_color-mix(in srgb, var(--color-brand-accent) 40%, transparent)]" : "text-white/20"}`} />
                  <span className="whitespace-nowrap">{group.name}</span>
                </Link>
              );
            }

            const GroupIcon = group.icon || Layers;
            const isExpanded = expandedGroups[group.name] ?? false;
            const hasActiveChild = group.items!.some(item => isItemActive(item.href));
 
            return (
              <div key={group.name} className="space-y-1.5 bg-white/[0.02] border border-white/5 p-2 rounded-[1.5rem]">
                {/* Group Header Button */}
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={`flex items-center justify-between w-full p-3.5 text-[12px] font-semibold rounded-2xl transition-all hover:bg-white/5 hover:text-white text-left cursor-pointer ${
                    hasActiveChild ? "text-white" : "text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className={`w-4 h-4 ${hasActiveChild ? "text-brand-accent drop-shadow-[0_0_6px_color-mix(in srgb, var(--color-brand-accent) 40%, transparent)]" : "text-white/20"}`} />
                    <span className="whitespace-nowrap">{group.name}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
 
                {/* Sub-items list with Framer Motion Accordion Collapse/Expand */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden pl-3 space-y-1"
                    >
                      {group.items!.map((item) => {
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 text-[11px] font-medium rounded-xl transition-all duration-300 relative group ${
                              isActive
                                ? "bg-white/5 text-white border border-white/5"
                                : "text-white/30 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              isActive ? "bg-brand-accent scale-110 shadow-[0_0_8px_#C62828]" : "bg-white/10 group-hover:bg-white/30"
                            }`} />
                            <span className="whitespace-nowrap">{item.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </nav>

      <div className={`${isCollapsed ? 'p-4 flex flex-col items-center' : 'p-8'} border-t border-white/5 transition-all duration-500`}>
        <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="min-w-[40px] w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent text-xs font-black border border-brand-accent/20 shadow-lg shadow-brand-accent/10">
            AD
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[11px] font-semibold text-white/40 mb-0.5">Admin</p>
              <p className="text-xs font-bold text-white whitespace-nowrap">Administrator</p>
            </motion.div>
          )}
        </div>
        
        <div className="mt-8">
          <button className={`flex items-center gap-4 p-4 w-full text-left text-[11px] font-semibold rounded-2xl text-red-500 hover:bg-red-500/10 transition-all ${isCollapsed ? 'justify-center p-0 h-10 w-10' : ''}`}>
            <LogOut className="w-5 h-5 min-w-[20px]" /> 
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
      </div>
    </motion.aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="bg-[#0A0A0A] border-r border-white/5 h-full w-[320px] shrink-0" />}>
      <SidebarContent />
    </Suspense>
  );
}

