import { Plane, Search, List, Sparkles, TrendingDown, Hourglass } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '@/context/SearchContext';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  requiresResult?: true;
  requiresLoading?: true;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Search', icon: <Search className="size-4" />, path: '/' },
  { label: 'Searching…', icon: <Hourglass className="size-4" />, path: '/searching', requiresLoading: true },
  { label: 'Results', icon: <List className="size-4" />, path: '/results', requiresResult: true },
  { label: 'Ask AI', icon: <Sparkles className="size-4" />, path: '/ai' },
];

function DrawerContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, loading } = useSearch();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5">
        <div className="size-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Plane className="size-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-[15px] tracking-tight leading-none">GoFlyTo</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Flight Optimizer</div>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          Navigation
        </p>
        {NAV_ITEMS.map(item => {
          if (item.requiresLoading && !loading) return null;
          const active = location.pathname === item.path;
          const disabled = (item.requiresResult && !result) || (item.requiresLoading && !loading);
          return (
            <button
              key={item.path}
              disabled={!!disabled}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-primary'
                  : 'text-foreground hover:bg-muted',
                disabled && 'opacity-40 pointer-events-none',
              )}
            >
              <span className={cn('shrink-0', active ? 'text-primary' : 'text-muted-foreground')}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.requiresResult && result && (
                <Badge variant="default" className="h-5 text-[11px] px-1.5">
                  {result.offers.length}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* Pro tip */}
      <div className="p-3">
        <div className="bg-accent rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="size-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-primary">Pro tip</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Open-jaw routing (fly into one city, out of another) often saves 10–20%.
          </p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export function NavDrawer({ mobileOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile: Sheet */}
      <Sheet open={mobileOpen} onOpenChange={open => !open && onClose()}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <DrawerContent />
        </SheetContent>
      </Sheet>

      {/* Desktop: fixed sidebar */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-border bg-sidebar"
        style={{ width: DRAWER_WIDTH }}
      >
        <DrawerContent />
      </aside>
    </>
  );
}
