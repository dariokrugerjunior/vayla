import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ProductCard } from '../../components/storefront/ProductCard';
import { FilterSheet } from '../../components/storefront/FilterSheet';
import { useStore } from '../../contexts/StoreContext';
import { Category, Product, StoreBannerSettings } from '../../types';
import { fetchCategories, fetchProducts, fetchStoreBannerSettings } from '../../services/storefront';

export function StoreHome() {
  const { store, storeSlug } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bannerSettings, setBannerSettings] = useState<StoreBannerSettings | null>(null);

  useEffect(() => {
    if (!storeSlug) return;
    fetchProducts(storeSlug).then(setProducts).catch(() => setProducts([]));
    fetchCategories(storeSlug).then(setCategories).catch(() => setCategories([]));
    fetchStoreBannerSettings(storeSlug).then(setBannerSettings).catch(() => setBannerSettings(null));
  }, [storeSlug]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const selectedCategorySlug = (searchParams.get('category') || '').trim();
  const selectedCategory = categories.find((c) => c.slug === selectedCategorySlug);
  const selectedCategoryId = selectedCategory?.id || null;

  const featuredProducts = products.filter((p) => p.featured);
  const filteredProducts = products.filter((product) => {
    if (selectedCategoryId && product.categoryId !== selectedCategoryId) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  const handleCategoryChange = (categoryId: number | null) => {
    const baseStorePath = `/${storeSlug}`;
    if (!categoryId) {
      navigate(baseStorePath);
      return;
    }
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      navigate(baseStorePath);
      return;
    }
    navigate(`${baseStorePath}?category=${category.slug}`);
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={store.bannerUrl || 'https://placehold.co/1200x500?text=Banner'}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl text-white"
            >
              <h1
                className="text-4xl md:text-6xl font-bold mb-4"
                style={{ color: bannerSettings?.titleColor || '#FFFFFF' }}
              >
                {bannerSettings?.title || 'Coleção Outono/Inverno 2026'}
              </h1>
              <p
                className="text-lg md:text-xl mb-6"
                style={{ color: bannerSettings?.subtitleColor || '#F5F5F5' }}
              >
                {bannerSettings?.subtitle || 'Descubra as últimas tendências em moda com até 30% de desconto'}
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full"
                style={{
                  backgroundColor: bannerSettings?.buttonBgColor || '#FFFFFF',
                  color: bannerSettings?.buttonTextColor || '#111111',
                }}
              >
                <a href={bannerSettings?.buttonUrl || '#'} target={bannerSettings?.buttonUrl?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {bannerSettings?.buttonText || 'Ver Coleção'}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Produtos em Destaque</h2>
            <p className="text-neutral-600">Os mais populares desta temporada</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Todos os Produtos</h2>
            <p className="text-neutral-600">{filteredProducts.length} produtos encontrados</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        categories={categories}
      />
    </div>
  );
}
