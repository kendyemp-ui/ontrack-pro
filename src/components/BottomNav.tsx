import { useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Target, Clock, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/evolucao', label: 'Evolução', icon: TrendingUp },
  { path: '/diet', label: 'Meta', icon: Target },
  { path: '/history', label: 'Histórico', icon: Clock },
  { path: '/profile', label: 'Perfil', icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 border-t border-border/40 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
