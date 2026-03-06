import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../contexts/StoreContext';

export function WhatsAppButton() {
  const { store } = useStore();

  const handleClick = () => {
    const message = 'Olá! Gostaria de mais informações sobre os produtos.';
    const whatsappUrl = `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      aria-label="Abrir WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.button>
  );
}
