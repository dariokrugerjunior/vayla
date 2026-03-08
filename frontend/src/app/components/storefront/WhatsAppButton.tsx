import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

type WhatsAppButtonProps = {
  phoneNumber: string;
};

export function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  const handleClick = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (!digits) return;

    const message = 'Olá! Gostaria de mais informações sobre os produtos.';
    const whatsappUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!phoneNumber.replace(/\D/g, '')) return null;

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
