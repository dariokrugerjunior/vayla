import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { checkoutWhatsApp } from '../../services/storefront';

export function WhatsAppCheckout() {
  const { items, getTotal, clearCart } = useCart();
  const { store, storeSlug } = useStore();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0 || !store) {
    return null;
  }

  const handleSendToWhatsApp = async () => {
    if (!customerName.trim()) {
      toast.error('Por favor, preencha seu nome');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Por favor, preencha seu telefone');
      return;
    }

    try {
      const result = await checkoutWhatsApp({
        store_slug: storeSlug,
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variation.id,
          quantity: item.quantity,
        })),
      });

      window.open(result.whatsapp_url, '_blank');

      setTimeout(() => {
        clearCart();
        navigate('/');
        toast.success('Pedido enviado! Em breve entraremos em contato.');
      }, 1000);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Finalizar Pedido</h1>
            <p className="text-neutral-600">
              Complete seus dados e envie o pedido pelo WhatsApp
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 border border-neutral-200 space-y-8">
            {/* Customer Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Suas Informações</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const override = item.variation.priceOverride || 0;
                  const price = override > 0 ? override : item.product.discountPrice || item.product.price;
                  return (
                    <div
                      key={`${item.product.id}-${item.variation.id}`}
                      className="flex gap-4"
                    >
                      <img
                        src={item.product.images[0] || 'https://placehold.co/600x600?text=Produto'}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-neutral-600">
                          {item.variation.color} • {item.variation.size}
                        </p>
                        <p className="text-sm text-neutral-600">Qtd: {item.quantity}</p>
                      </div>
                      <div className="font-semibold">
                        R$ {(price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-3xl font-bold">R$ {total.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full rounded-full text-base"
                style={{ backgroundColor: store.primaryColor }}
                onClick={handleSendToWhatsApp}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Enviar Pedido para WhatsApp
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Como funciona:</p>
                  <p>
                    Ao clicar no botão acima, você será direcionado para o WhatsApp com
                    seu pedido já preenchido. Nossa equipe entrará em contato para
                    confirmar o pagamento e a entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
