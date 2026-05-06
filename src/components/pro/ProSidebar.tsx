import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Bell, MessageCircle, LogOut,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePro } from '@/contexts/ProContext';
import { useNavigate } from 'react-router-dom';
import { GroveIcon } from '@/components/GroveIcon';

const items = [
  { title: 'Dashboard', url: '/pro/dashboard', icon: LayoutDashboard },
  { title: 'Pacientes', url: '/pro/pacientes', icon: Users },
  { title: 'Novo paciente', url: '/pro/pacientes/novo', icon: UserPlus },
  { title: 'Alertas', url: '/pro/alertas', icon: Bell },
  { title: 'WhatsApp', url: '/pro/whatsapp', icon: MessageCircle },
];

export function ProSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { logout, professionalName } = usePro();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/pro/login');
  };

  const initials = professionalName
    ? professionalName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : 'PR';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          {collapsed ? (
            <GroveIcon size={28} className="mx-auto" />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <GroveIcon size={28} wordmark wordmarkSize={16} />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Pro</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                const active = location.pathname === item.url
                  || (item.url !== '/pro/dashboard' && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{professionalName}</p>
              <p className="text-[10px] text-muted-foreground">Nutricionista</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
