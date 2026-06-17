import { Plane, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-16 bg-white border-b border-border flex items-center px-4 md:pl-[calc(240px+1rem)]">
      <Button
        variant="ghost" size="icon"
        className="md:hidden mr-2"
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Plane className="size-5 text-primary" />
        <span className="font-bold text-[18px] tracking-tight">GoFlyTo</span>
      </button>
    </header>
  );
}
