'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  name: string;
}

interface DesktopNavProps {
  links: NavLink[];
}

/**
 * Desktop navigation with active link highlighting.
 * Client component so it can access usePathname() for current route.
 */
export function DesktopNav({ links }: DesktopNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm transition-colors',
              isActive
                ? 'font-semibold text-foreground border-b-2 border-primary pb-0.5'
                : 'font-medium text-muted-foreground hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
