import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { WhatsAppButton } from '../components/storefront/WhatsAppButton';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Category } from '../types';
import { fetchCategories, trackVisit } from '../services/storefront';
import { StoreNotFound } from '../components/StoreNotFound';

export function StorefrontLayout() {
  const { items } = useCart();
  const { store, storeID, storeNotFound, isLoading } = useStore();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const baseStorePath = `/stores/id/${storeID}`;

  useEffect(() => {
    if (!storeID) return;
    fetchCategories(storeID)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [storeID]);

  useEffect(() => {
    if (!storeID) return;
    const key = 'vayla_session_id';
    let sessionId = localStorage.getItem(key) || '';
    if (!sessionId) {
      sessionId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, sessionId);
    }

    trackVisit({
      store_id: storeID,
      path: `${location.pathname}${location.search}`,
      session_id: sessionId,
      referrer: document.referrer || '',
    }).catch(() => {});
  }, [storeID, location.pathname, location.search]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  if (storeNotFound) {
    return <StoreNotFound storeID={storeID} />;
  }

  if (isLoading || !store) {
    return <div className="p-6">Carregando loja...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to={baseStorePath} className="flex items-center gap-3">
              <img
                src={store.logoUrl || 'https://placehold.co/64x64?text=Logo'}
                alt={store.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-lg hidden sm:block">{store.name}</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`${baseStorePath}/cart`}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 mt-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type="search"
                        placeholder="Buscar produtos..."
                        className="pl-10"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Categorias</h3>
                      <div className="flex flex-col gap-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`${baseStorePath}?category=${category.slug}`}
                            className="text-neutral-600 hover:text-neutral-900 py-2"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="hidden md:block border-t border-neutral-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-6 py-3 overflow-x-auto">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`${baseStorePath}?category=${category.slug}`}
                  className="text-sm text-neutral-600 hover:text-neutral-900 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={store.logoUrl || 'https://placehold.co/64x64?text=Logo'}
                  alt={store.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{store.name}</span>
              </div>
              <p className="text-sm text-neutral-600">
                Sua loja de moda online com as melhores tendências.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categorias</h3>
              <div className="flex flex-col gap-2">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    key={category.id}
                    to={`${baseStorePath}?category=${category.slug}`}
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Atendimento</h3>
              <div className="flex flex-col gap-2 text-sm text-neutral-600">
                <p>WhatsApp: {store.whatsappNumber}</p>
                <p>{store.serviceHours || 'Seg-Sex: 9h às 18h | Sáb: 9h às 13h'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informações</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Sobre nós
                </a>
                <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Política de Privacidade
                </a>
                <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-200 mt-8 pt-6 text-center text-sm text-neutral-600">
            © 2026 {store.name}. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {location.pathname !== `${baseStorePath}/checkout` && <WhatsAppButton />}
    </div>
  );
}
