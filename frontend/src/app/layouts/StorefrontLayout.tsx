import { Outlet, Link, useLocation } from 'react-router';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { WhatsAppButton } from '../components/storefront/WhatsAppButton';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { mockCategories } from '../data/mockData';

export function StorefrontLayout() {
  const { items } = useCart();
  const { store } = useStore();
  const location = useLocation();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={store.logo}
                alt={store.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-lg hidden sm:block">{store.name}</span>
            </Link>

            {/* Search - Desktop */}
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu */}
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
                        {mockCategories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/?category=${category.slug}`}
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

        {/* Categories - Desktop */}
        <div className="hidden md:block border-t border-neutral-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-6 py-3 overflow-x-auto">
              {mockCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/?category=${category.slug}`}
                  className="text-sm text-neutral-600 hover:text-neutral-900 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={store.logo}
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
                {mockCategories.slice(0, 4).map((category) => (
                  <Link
                    key={category.id}
                    to={`/?category=${category.slug}`}
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
                <p>Seg-Sex: 9h às 18h</p>
                <p>Sáb: 9h às 13h</p>
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

      {/* Floating WhatsApp Button */}
      {location.pathname !== '/checkout' && <WhatsAppButton />}
    </div>
  );
}
