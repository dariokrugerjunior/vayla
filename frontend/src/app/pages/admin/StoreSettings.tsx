import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useStore } from '../../contexts/StoreContext';
import { fetchAdminBannerSettings, updateAdminBannerSettings } from '../../services/storefront';
import { toast } from 'sonner';

export function StoreSettings() {
  const { store, storeID, updateStore } = useStore();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#111111');

  const [bannerTitle, setBannerTitle] = useState('Coleção Outono/Inverno 2026');
  const [bannerSubtitle, setBannerSubtitle] = useState('Descubra as últimas tendências em moda com até 30% de desconto');
  const [bannerButtonText, setBannerButtonText] = useState('Ver Coleção');
  const [bannerButtonURL, setBannerButtonURL] = useState('');
  const [bannerTitleColor, setBannerTitleColor] = useState('#FFFFFF');
  const [bannerSubtitleColor, setBannerSubtitleColor] = useState('#F5F5F5');
  const [bannerButtonBGColor, setBannerButtonBGColor] = useState('#FFFFFF');
  const [bannerButtonTextColor, setBannerButtonTextColor] = useState('#111111');

  useEffect(() => {
    if (!store) return;
    setName(store.name);
    setDomain(store.domain || store.subdomain || '');
    setPrimaryColor(store.primaryColor);
  }, [store]);

  useEffect(() => {
    if (!storeID) return;
    fetchAdminBannerSettings(storeID)
      .then((banner) => {
        setBannerTitle(banner.title);
        setBannerSubtitle(banner.subtitle);
        setBannerButtonText(banner.buttonText);
        setBannerButtonURL(banner.buttonUrl || '');
        setBannerTitleColor(banner.titleColor);
        setBannerSubtitleColor(banner.subtitleColor);
        setBannerButtonBGColor(banner.buttonBgColor);
        setBannerButtonTextColor(banner.buttonTextColor);
      })
      .catch(() => {
        // Keep defaults when banner settings do not exist yet
      });
  }, [storeID]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const handleSave = async () => {
    await updateStore({ name, domain, primaryColor });
    await updateAdminBannerSettings(storeID, {
      title: bannerTitle,
      subtitle: bannerSubtitle,
      button_text: bannerButtonText,
      button_url: bannerButtonURL,
      title_color: bannerTitleColor,
      subtitle_color: bannerSubtitleColor,
      button_bg_color: bannerButtonBGColor,
      button_text_color: bannerButtonTextColor,
      is_active: true,
    });
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações da Loja</h1>
        <p className="text-neutral-600">Personalize a aparência e informações da sua loja</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Banner da Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bannerTitle">Título</Label>
            <Input id="bannerTitle" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="bannerSubtitle">Subtítulo</Label>
            <Input id="bannerSubtitle" value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bannerButtonText">Texto do Botão</Label>
              <Input id="bannerButtonText" value={bannerButtonText} onChange={(e) => setBannerButtonText(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="bannerButtonURL">Link do Botão</Label>
              <Input id="bannerButtonURL" value={bannerButtonURL} onChange={(e) => setBannerButtonURL(e.target.value)} placeholder="/stores/id/1?category=camisetas ou https://..." className="mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bannerTitleColor">Cor do Título</Label>
              <Input id="bannerTitleColor" type="color" value={bannerTitleColor} onChange={(e) => setBannerTitleColor(e.target.value)} className="mt-1.5 w-24" />
            </div>
            <div>
              <Label htmlFor="bannerSubtitleColor">Cor do Subtítulo</Label>
              <Input id="bannerSubtitleColor" type="color" value={bannerSubtitleColor} onChange={(e) => setBannerSubtitleColor(e.target.value)} className="mt-1.5 w-24" />
            </div>
            <div>
              <Label htmlFor="bannerButtonBGColor">Cor de Fundo do Botão</Label>
              <Input id="bannerButtonBGColor" type="color" value={bannerButtonBGColor} onChange={(e) => setBannerButtonBGColor(e.target.value)} className="mt-1.5 w-24" />
            </div>
            <div>
              <Label htmlFor="bannerButtonTextColor">Cor do Texto do Botão</Label>
              <Input id="bannerButtonTextColor" type="color" value={bannerButtonTextColor} onChange={(e) => setBannerButtonTextColor(e.target.value)} className="mt-1.5 w-24" />
            </div>
          </div>

          <div className="p-4 rounded-lg border border-neutral-200" style={{ backgroundColor: '#111111' }}>
            <h3 style={{ color: bannerTitleColor }} className="text-2xl font-bold mb-2">{bannerTitle || 'Título do banner'}</h3>
            <p style={{ color: bannerSubtitleColor }} className="mb-4">{bannerSubtitle || 'Subtítulo do banner'}</p>
            <span
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: bannerButtonBGColor, color: bannerButtonTextColor }}
            >
              {bannerButtonText || 'Botão'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
