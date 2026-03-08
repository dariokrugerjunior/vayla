import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, Minus, Plus, Check, ShoppingCart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ProductCard } from '../../components/storefront/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import { Product } from '../../types';
import { fetchProduct, fetchProducts } from '../../services/storefront';
import { toast } from 'sonner';

export function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { store, storeSlug } = useStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug || !storeSlug) return;
    fetchProduct(storeSlug, slug)
      .then(async (p) => {
        setProduct(p);
        try {
          const list = await fetchProducts(storeSlug);
          const related = list.filter((item) => item.categoryId === p.categoryId && item.id !== p.id);
          setRelatedProducts(related.slice(0, 4));
        } catch {
          setRelatedProducts([]);
        }
      })
      .catch(() => setProduct(null));
  }, [slug, storeSlug]);

  if (!product || !store) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
        <Link to={`/${storeSlug}`}>
          <Button>Voltar para a loja</Button>
        </Link>
      </div>
    );
  }

  const availableColors = [...new Set(product.variations.map((v) => v.color))];
  const availableSizes = selectedColor
    ? product.variations.filter((v) => v.color === selectedColor).map((v) => v.size)
    : [...new Set(product.variations.map((v) => v.size))];

  const selectedVariation = product.variations.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const handleAddToCart = () => {
    if (!selectedVariation) return;
    addToCart(product, selectedVariation, quantity);
  };

  const handleBuyWhatsApp = async () => {
    if (!selectedVariation) return;
    addToCart(product, selectedVariation, quantity);
    navigate(`/${storeSlug}/checkout`);
  };

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0;

  return (
    <div>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to={`/${storeSlug}`} className="inline-flex items-center text-neutral-600 hover:text-neutral-900">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-neutral-100"
            >
              <img
                src={product.images[selectedImage] || 'https://placehold.co/600x600?text=Produto'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    aspect-square rounded-lg overflow-hidden border-2 transition-all
                    ${selectedImage === index ? 'border-indigo-600' : 'border-transparent'}
                  `}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.categoryName || 'Categoria'}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">R$ {price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-xl text-neutral-500 line-through">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <p className="text-neutral-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block font-semibold mb-3">
                Cor: {selectedColor && <span className="text-neutral-600">{selectedColor}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize('');
                    }}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all
                      ${
                        selectedColor === color
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block font-semibold mb-3">
                Tamanho: {selectedSize && <span className="text-neutral-600">{selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!selectedColor}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        selectedSize === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Indicator */}
            {selectedVariation && (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {selectedVariation.stock} unidades em estoque
                </span>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block font-semibold mb-3">Quantidade</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!selectedVariation || quantity >= selectedVariation.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                size="lg"
                className="w-full rounded-full text-base"
                style={{ backgroundColor: store.primaryColor }}
                onClick={handleBuyWhatsApp}
                disabled={!selectedVariation}
              >
                Comprar pelo WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full text-base"
                onClick={handleAddToCart}
                disabled={!selectedVariation}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((productItem) => (
                <ProductCard key={productItem.id} product={productItem} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

