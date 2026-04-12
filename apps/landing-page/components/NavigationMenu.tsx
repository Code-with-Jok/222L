"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu as NavigationMenuUI,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@repo/ui/components/ui/navigation-menu";
import { curationItems, exploreItems } from "@/constants";

export function NavigationMenu() {
  return (
    <NavigationMenuUI>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="font-body font-medium text-sm uppercase tracking-wide text-text-muted hover:text-text-primary data-[active]:text-brand-primary data-[state=open]:text-brand-primary bg-transparent hover:bg-transparent transition-all duration-base">
            Explore
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid nav-width-sm gap-2 p-4 md:nav-width-md md:grid-cols-2 lg:nav-width-lg">
              {exploreItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger className="font-body font-medium text-sm uppercase tracking-wide text-text-muted hover:text-text-primary data-[active]:text-brand-primary data-[state=open]:text-brand-primary bg-transparent hover:bg-transparent transition-all duration-base">
            Curations
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid nav-width-sm gap-2 p-4 md:nav-width-md md:grid-cols-2 lg:nav-width-lg">
              {curationItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuUI>
  );
}

function ListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; icon?: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="group flex flex-col gap-1.5 p-4 rounded-xl hover:bg-brand-primary/5 transition-all duration-fast border border-transparent hover:border-brand-primary/10"
        >
          <div className="flex items-center gap-2.5 mb-1">
            {icon && <span className="text-lg">{icon}</span>}
            <div className="font-display font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
              {title}
            </div>
          </div>
          <div className="font-body text-xs-nav text-text-secondary leading-relaxed group-hover:text-text-primary/80 transition-colors">
            {children}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
