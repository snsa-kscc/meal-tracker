"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NAVIGATION_ITEMS } from "@/data/navigation";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50">
      <div className="mx-auto w-[90%] max-w-md rounded-[12px] overflow-hidden backdrop-blur-[10px] bg-white/40 border border-white/20 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)_inset,0px_2px_2px_0px_rgba(0,0,0,0.25)]">
        <div className="flex h-16 justify-around items-center">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center px-2"
              >
                <IconComponent 
                  className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-600"}`} 
                />
                <span className={`text-[10px] mt-1 ${isActive ? "text-primary font-medium" : "text-gray-600"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
