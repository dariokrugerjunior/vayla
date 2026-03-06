import { Link } from 'react-router';
import { Badge } from '../ui/badge';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0;
  const image = product.images[0] || 'https://placehold.co/600x600?text=Produto';
  const slug = product.slug || String(product.id);

  return (
    <Link to={`/product/${slug}`}>
      <div className="group cursor-pointer">
        <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden mb-3 relative">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700">
              -{Math.round(((product.price - price) / product.price) * 100)}%
            </Badge>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="font-bold">R$ {price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-neutral-500 line-through">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
