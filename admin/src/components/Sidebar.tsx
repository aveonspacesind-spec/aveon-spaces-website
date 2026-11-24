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
  Folder,
  Quote,
  Wrench,
  BookOpen,
  Layers,
  BarChart,
  ChevronDown,
  Mail,
  ShoppingBag,
  Users,
  Star,
  Activity,
  Globe
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuGroups: MenuItem[] = [
    { name: "Dashboard", icon: Home, href: "/" },
    {
      name: "Orders & Inquiries",
      icon: ShoppingBag,
      items: [
        { name: "All Orders", icon: ShoppingBag, href: "/orders" },
        { name: "Pending Orders", icon: Activity, href: "/orders?filter=Pending" },
        { name: "Completed Orders", icon: Star, href: "/orders?filter=Completed" },
        { name: "Customer Messages", icon: MessageSquare, href: "/orders?view=contact" },
        { name: "Customer Reviews", icon: Star, href: "/reviews" },
        { name: "Newsletter Signups", icon: Mail, href: "/newsletter" }
      ]
    },
    {
      name: "Products & Catalog",
      icon: Package,
      items: [
        { name: "Products", icon: Package, href: "/products" },
        { name: "Categories", icon: FolderTree, href: "/categories" }
      ]
    },
    {
      name: "Website Content",
      icon: Globe,
      items: [
        { name: "Homepage Content", icon: Home, href: "/settings" },
        { name: "Projects", icon: Folder, href: "/projects" },
        { name: "Testimonials", icon: Quote, href: "/testimonials" },
        { name: "Team Members", icon: Users, href: "/team" },
        { name: "Statistics", icon: BarChart, href: "/stats" },
        { name: "Blog & Articles", icon: BookOpen, href: "/insights" },
        { name: "Contact Details", icon: Settings, href: "/contact" },
        { name: "Media Images", icon: ImageIcon, href: "/media" }
      ]
    },
    {
      name: "System Settings",
      icon: Settings,
      items: [
        { name: "System Utilities", icon: Wrench, href: "/system-utilities" }
      ]
    }
  ];

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Orders & Inquiries": true,
    "Products & Catalog": true,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
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
    
    menuGroups.forEach(group => {
      if (group.items) {
        const hasActiveChild = group.items.some(item => isItemActive(item.href));
        if (hasActiveChild) {
          setExpandedGroups(prev => ({ ...prev, [group.name]: true }));
        }
      }
    });
  }, [pathname, searchParams, isCollapsed]);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 90 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-[#0A0A0A] border-r border-white/10 h-full flex flex-col shadow-xl z-[100] relative overflow-visible shrink-0 select-none"
    >
      {/* Collapse/Expand Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-6 -right-3.5 w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full flex items-center justify-center z-[110] shadow-md border border-white/20 cursor-pointer transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
 
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Brand / Logo Header */}
        <div className={`flex items-center transition-all ${isCollapsed ? 'justify-center p-4 my-2' : 'px-6 py-6'}`}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
              A
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-tight">Aveon Spaces</span>
                <span className="text-xs text-neutral-400 font-medium">Admin Panel</span>
              </div>
            )}
          </Link>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pr-2 pb-6">
          {isCollapsed ? (
            // Collapsed view (Icons only)
            <div className="space-y-2">
              {menuGroups.flatMap(group => 
                group.items ? group.items.map(item => ({ ...item, uniqueKey: `${group.name}-${item.name}` })) 
                            : [{ ...group, uniqueKey: group.name, href: group.href! }]
              ).map((item) => {
                const isActive = isItemActive(item.href);
                return (
                  <Link 
                    key={item.uniqueKey}
                    href={item.href} 
                    title={item.name}
                    className={`flex items-center justify-center p-3 rounded-xl transition-colors relative group ${
                      isActive 
                        ? "bg-brand-accent text-white shadow-md" 
                        : "text-neutral-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-neutral-900 border border-white/10 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg whitespace-nowrap z-[300]">
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            // Expanded Accordion Menu
            menuGroups.map((group) => {
              if (group.href) {
                const isActive = isItemActive(group.href);
                return (
                  <Link
                    key={group.name}
                    href={group.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-brand-accent text-white shadow-sm"
                        : "text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <group.icon className="w-4 h-4 shrink-0" />
                    <span>{group.name}</span>
                  </Link>
                );
              }

              const GroupIcon = group.icon || Layers;
              const isExpanded = expandedGroups[group.name] ?? false;
              const hasActiveChild = group.items!.some(item => isItemActive(item.href));
   
              return (
                <div key={group.name} className="space-y-1">
                  {/* Group Title Button */}
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors text-left cursor-pointer ${
                      hasActiveChild 
                        ? "text-white bg-white/5 font-semibold" 
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className={`w-4 h-4 shrink-0 ${hasActiveChild ? "text-brand-accent" : "text-neutral-400"}`} />
                      <span>{group.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
   
                  {/* Sub-items */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden pl-7 space-y-1"
                      >
                        {group.items!.map((item) => {
                          const isActive = isItemActive(item.href);
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                isActive
                                  ? "bg-brand-accent text-white font-medium shadow-sm"
                                  : "text-neutral-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span>{item.name}</span>
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

        {/* Footer with User info & Sign out */}
        <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                  AD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">Administrator</span>
                  <span className="text-xs text-neutral-400">Store Manager</span>
                </div>
              </div>
              <button 
                title="Sign out"
                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              title="Sign out"
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="bg-[#0A0A0A] border-r border-white/10 h-full w-[280px] shrink-0" />}>
      <SidebarContent />
    </Suspense>
  );
}
