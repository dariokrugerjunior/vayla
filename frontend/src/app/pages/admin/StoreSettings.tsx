import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useStore } from '../../contexts/StoreContext';
import { toast } from 'sonner';

export function StoreSettings() {
  const { store, updateStore } = useStore();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#111111');

  useEffect(() => {
    if (!store) return;
    setName(store.name);
    setDomain(store.domain || store.subdomain || '');
    setPrimaryColor(store.primaryColor);
  }, [store]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const handleSave = async () => {
    await updateStore({ name, domain, primaryColor });
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações da Loja</h1>
        <p className="text-neutral-600">Personalize a aparência e informações da sua loja</p>
      </div>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storeName">Nome da Loja</Label>
            <Input
              id="storeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="domain">Domínio / Subdomínio</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <span className="flex items-center px-3 bg-neutral-100 rounded-lg text-sm text-neutral-600">
                .catalogo.app
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Seu catálogo estará disponível em: {domain}.catalogo.app
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div>
            <Label>Logo da Loja</Label>
            <div className="flex items-center gap-6 mt-3">
              <img
                src={store.logoUrl || 'https://placehold.co/200x200?text=Logo'}
                alt="Logo"
                className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200"
              />
              <div className="flex-1">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
                <p className="text-sm text-neutral-500 mt-2">
                  Recomendado: 200x200px, formato PNG ou JPG
                </p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div>
            <Label>Banner Principal</Label>
            <div className="mt-3">
              <img
                src={store.bannerUrl || 'https://placehold.co/1200x400?text=Banner'}
                alt="Banner"
                className="w-full h-40 rounded-xl object-cover border-2 border-neutral-200"
              />
              <div className="mt-3">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
                <p className="text-sm text-neutral-500 mt-2">
                  Recomendado: 1200x400px, formato PNG ou JPG
                </p>
              </div>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <div className="flex items-center gap-4 mt-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-neutral-200"
                style={{ backgroundColor: primaryColor }}
              />
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-24"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Esta cor será usada em botões e elementos de destaque
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
