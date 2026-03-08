import { Link, useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import { motion } from 'motion/react';

export function Cart() {
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();
  const { storeSlug } = useStore();
  const navigate = useNavigate();

  const total = getTotal();
  const baseStorePath = `/${storeSlug}`;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
          <p className="text-neutral-600 mb-6">
            Adicione produtos ao carrinho para continuar comprando
          </p>
          <Link to={baseStorePath}>
            <Button size="lg" className="rounded-full">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => {
            const override = item.variation.priceOverride || 0;
            const price = override > 0 ? override : item.product.discountPrice || item.product.price;
            const image = item.product.images[0] || 'https://placehold.co/600x600?text=Produto';
            return (
              <motion.div
                key={`${item.product.id}-${item.variation.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 md:p-6 border border-neutral-200"
              >
                <div className="flex gap-4">
                  <img
                    src={image}
                    alt={item.product.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 truncate">{item.product.name}</h3>
                    <p className="text-sm text-neutral-600 mb-2">
                      {item.variation.color} • {item.variation.size}
                    </p>
                    <p className="text-lg font-bold">R$ {price.toFixed(2)}</p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.variation.id,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.variation.id,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.variation.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.product.id, item.variation.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-neutral-200 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} itens)
                </span>
                <span className="font-semibold">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full rounded-full mb-3"
              onClick={() => navigate(`${baseStorePath}/checkout`)}
            >
              Finalizar pelo WhatsApp
            </Button>

            <Link to={baseStorePath}>
              <Button variant="outline" size="lg" className="w-full rounded-full">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
