import { useState, useEffect } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useStore } from '../../contexts/StoreContext';
import { toast } from 'sonner';
import { fetchWhatsAppSettings, updateWhatsAppSettings } from '../../services/storefront';

export function WhatsAppSettings() {
  const { store } = useStore();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!store) return;
    fetchWhatsAppSettings(store.id)
      .then((data: any) => {
        setWhatsappNumber(data.whatsapp_number || store.whatsappNumber);
        setMessageTemplate(data.default_message_template || 'Olá! Quero fazer este pedido:');
      })
      .catch(() => {
        setWhatsappNumber(store.whatsappNumber);
        setMessageTemplate('Olá! Quero fazer este pedido:');
      });
  }, [store]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const handleSave = async () => {
    await updateWhatsAppSettings(store.id, {
      whatsapp_number: whatsappNumber,
      default_message_template: messageTemplate,
      cart_message_template: messageTemplate,
      single_product_message_template: messageTemplate,
      is_active: true,
    });
    toast.success('Configurações do WhatsApp salvas!');
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(messageTemplate);
    setCopied(true);
    toast.success('Template copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const previewMessage = messageTemplate
    .replace('{ORDER_DETAILS}', '• Camiseta Premium Cotton\n  Cor: Preto / Tamanho: M\n  Qtd: 2 - R$ 139.80')
    .replace('{TOTAL}', '139.80');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações do WhatsApp</h1>
        <p className="text-neutral-600">Configure o número e mensagens automáticas</p>
      </div>

      {/* WhatsApp Number */}
      <Card>
        <CardHeader>
          <CardTitle>Número do WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsappNumber">Número com código do país</Label>
            <Input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+5511999999999"
              className="mt-1.5"
            />
            <p className="text-sm text-neutral-500 mt-1">
              Formato: +55 (código do país) + DDD + número
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Importante:</p>
                <p>
                  Este número receberá todos os pedidos dos clientes. Certifique-se de que
                  está correto e ativo no WhatsApp Business.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Template de Mensagem</CardTitle>
            <Button variant="outline" size="sm" onClick={handleCopyTemplate}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="messageTemplate">Mensagem Padrão</Label>
            <Textarea
              id="messageTemplate"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={6}
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">Variáveis disponíveis:</h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>
                <code className="bg-neutral-200 px-2 py-0.5 rounded text-xs">
                  {'{ORDER_DETAILS}'}
                </code>{' '}
                - Detalhes dos produtos do pedido
              </li>
              <li>
                <code className="bg-neutral-200 px-2 py-0.5 rounded text-xs">{'{TOTAL}'}</code> -
                Valor total do pedido
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview da Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  Exemplo de mensagem enviada:
                </p>
                <div className="bg-white rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {previewMessage}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-filled Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Campos Automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <p>
                <span className="font-medium">Nome do cliente:</span> Coletado automaticamente
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <p>
                <span className="font-medium">Telefone:</span> Coletado automaticamente
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <p>
                <span className="font-medium">Produtos:</span> Incluídos na mensagem
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <p>
                <span className="font-medium">Total:</span> Calculado automaticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          <MessageCircle className="h-5 w-5 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
