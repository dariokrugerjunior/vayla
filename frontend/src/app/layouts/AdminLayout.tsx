import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  Archive,
  BarChart3,
  Settings,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useStore } from '../contexts/StoreContext';
import { useState } from 'react';
import { clearAdminToken } from '../services/api';
import { StoreNotFound } from '../components/StoreNotFound';

const navigation = [
  { name: 'Dashboard', path: '', icon: LayoutDashboard },
  { name: 'Produtos', path: '/products', icon: Package },
  { name: 'Categorias', path: '/categories', icon: FolderOpen },
  { name: 'Pedidos', path: '/orders', icon: ShoppingBag },
  { name: 'Clientes', path: '/customers', icon: Users },
  { name: 'Estoque', path: '/inventory', icon: Archive },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Configurações', path: '/settings', icon: Settings },
  { name: 'WhatsApp', path: '/whatsapp', icon: MessageCircle },
];

export function AdminLayout() {
  const { store, storeID, storeNotFound } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (storeNotFound) {
    return <StoreNotFound storeID={storeID} />;
  }

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const baseAdminPath = `/stores/id/${storeID}/admin`;
  const baseStorePath = `/stores/id/${storeID}`;

  const isActive = (href: string) => {
    if (href === baseAdminPath) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    clearAdminToken(storeID);
    navigate(`${baseAdminPath}/login`);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-neutral-200
          transform transition-transform duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <img
                src={store.logoUrl || 'https://placehold.co/64x64?text=Logo'}
                alt={store.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold">{store.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const href = `${baseAdminPath}${item.path}`;
                const active = isActive(href);
                return (
                  <Link
                    key={item.name}
                    to={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${
                        active
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-neutral-200">
            <Link
              to={baseStorePath}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Ver Loja
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-2 px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-neutral-500">{store.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
