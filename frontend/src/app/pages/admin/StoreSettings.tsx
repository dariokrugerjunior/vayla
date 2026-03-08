import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useStore } from '../../contexts/StoreContext';
import { fetchAdminBannerSettings, updateAdminBannerSettings, uploadAdminImage } from '../../services/storefront';
import { toast } from 'sonner';

const BANNER_OUTPUT_WIDTH = 1200;
const BANNER_OUTPUT_HEIGHT = 400;

type BannerCropPlacement = {
  drawWidth: number;
  drawHeight: number;
  x: number;
  y: number;
};

function getBannerCropPlacement(image: HTMLImageElement, zoom: number, panX: number, panY: number): BannerCropPlacement {
  const baseScale = Math.max(BANNER_OUTPUT_WIDTH / image.naturalWidth, BANNER_OUTPUT_HEIGHT / image.naturalHeight);
  const scaledWidth = image.naturalWidth * baseScale * zoom;
  const scaledHeight = image.naturalHeight * baseScale * zoom;
  const centerX = (BANNER_OUTPUT_WIDTH - scaledWidth) / 2;
  const centerY = (BANNER_OUTPUT_HEIGHT - scaledHeight) / 2;
  const maxMoveX = Math.max(0, (scaledWidth - BANNER_OUTPUT_WIDTH) / 2);
  const maxMoveY = Math.max(0, (scaledHeight - BANNER_OUTPUT_HEIGHT) / 2);

  return {
    drawWidth: scaledWidth,
    drawHeight: scaledHeight,
    x: centerX + maxMoveX * panX,
    y: centerY + maxMoveY * panY,
  };
}

function drawBannerPreview(canvas: HTMLCanvasElement, image: HTMLImageElement, zoom: number, panX: number, panY: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const placement = getBannerCropPlacement(image, zoom, panX, panY);
  ctx.clearRect(0, 0, BANNER_OUTPUT_WIDTH, BANNER_OUTPUT_HEIGHT);
  ctx.drawImage(image, placement.x, placement.y, placement.drawWidth, placement.drawHeight);
}

export function StoreSettings() {
  const { store, storeID, updateStore } = useStore();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#111111');
  const [serviceHours, setServiceHours] = useState('Seg-Sex: 9h às 18h | Sáb: 9h às 13h');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [bannerTitle, setBannerTitle] = useState('Coleção Outono/Inverno 2026');
  const [bannerSubtitle, setBannerSubtitle] = useState('Descubra as últimas tendências em moda com até 30% de desconto');
  const [bannerButtonText, setBannerButtonText] = useState('Ver Coleção');
  const [bannerButtonURL, setBannerButtonURL] = useState('');
  const [bannerTitleColor, setBannerTitleColor] = useState('#FFFFFF');
  const [bannerSubtitleColor, setBannerSubtitleColor] = useState('#F5F5F5');
  const [bannerButtonBGColor, setBannerButtonBGColor] = useState('#FFFFFF');
  const [bannerButtonTextColor, setBannerButtonTextColor] = useState('#111111');

  const [isBannerCropOpen, setIsBannerCropOpen] = useState(false);
  const [bannerCropSource, setBannerCropSource] = useState('');
  const [bannerCropFileName, setBannerCropFileName] = useState('');
  const [bannerCropFileType, setBannerCropFileType] = useState('image/jpeg');
  const [bannerCropOriginalFile, setBannerCropOriginalFile] = useState<File | null>(null);
  const [bannerCropImage, setBannerCropImage] = useState<HTMLImageElement | null>(null);
  const [bannerCropZoom, setBannerCropZoom] = useState(1);
  const [bannerCropPanX, setBannerCropPanX] = useState(0);
  const [bannerCropPanY, setBannerCropPanY] = useState(0);
  const bannerPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!store) return;
    setName(store.name);
    setDomain(store.domain || store.subdomain || '');
    setPrimaryColor(store.primaryColor);
    setServiceHours(store.serviceHours || 'Seg-Sex: 9h às 18h | Sáb: 9h às 13h');
    setLogoUrl(store.logoUrl || '');
    setBannerUrl(store.bannerUrl || '');
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

  useEffect(() => {
    if (!bannerCropSource) {
      setBannerCropImage(null);
      return;
    }

    const image = new Image();
    let cancelled = false;
    image.onload = () => {
      if (!cancelled) {
        setBannerCropImage(image);
      }
    };
    image.src = bannerCropSource;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(bannerCropSource);
    };
  }, [bannerCropSource]);

  useEffect(() => {
    if (!bannerCropImage || !bannerPreviewCanvasRef.current) return;
    drawBannerPreview(bannerPreviewCanvasRef.current, bannerCropImage, bannerCropZoom, bannerCropPanX, bannerCropPanY);
  }, [bannerCropImage, bannerCropPanX, bannerCropPanY, bannerCropZoom]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const handleSave = async () => {
    await updateStore({ name, domain, primaryColor, serviceHours, logoUrl, bannerUrl });
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

  const handleLogoUpload = async (file?: File) => {
    if (!file || !storeID) return;
    setIsUploadingLogo(true);
    try {
      const uploaded = await uploadAdminImage(storeID, 'logo', file);
      setLogoUrl(uploaded.url);
      toast.success('Logo enviada com sucesso!');
    } catch (err) {
      toast.error((err as Error).message || 'Falha no upload da logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const uploadBannerFile = async (file: File, successMessage: string) => {
    if (!storeID) return;
    setIsUploadingBanner(true);
    try {
      const uploaded = await uploadAdminImage(storeID, 'banner', file);
      setBannerUrl(uploaded.url);
      toast.success(successMessage);
      setIsBannerCropOpen(false);
      setBannerCropSource('');
      setBannerCropOriginalFile(null);
      setBannerCropImage(null);
      setBannerCropZoom(1);
      setBannerCropPanX(0);
      setBannerCropPanY(0);
    } catch (err) {
      toast.error((err as Error).message || 'Falha no upload do banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleBannerUpload = async (file?: File) => {
    if (!file || !storeID) return;

    const source = URL.createObjectURL(file);
    setBannerCropSource(source);
    setBannerCropFileName(file.name || 'banner');
    setBannerCropFileType(file.type || 'image/jpeg');
    setBannerCropOriginalFile(file);
    setBannerCropZoom(1);
    setBannerCropPanX(0);
    setBannerCropPanY(0);
    setIsBannerCropOpen(true);
  };

  const handleUploadOriginalBanner = async () => {
    if (!bannerCropOriginalFile) return;
    await uploadBannerFile(bannerCropOriginalFile, 'Banner enviado com sucesso!');
  };

  const handleCropAndUploadBanner = async () => {
    if (!bannerCropImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = BANNER_OUTPUT_WIDTH;
    canvas.height = BANNER_OUTPUT_HEIGHT;
    drawBannerPreview(canvas, bannerCropImage, bannerCropZoom, bannerCropPanX, bannerCropPanY);

    const outputType = bannerCropFileType === 'image/png' ? 'image/png' : 'image/jpeg';
    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const baseName = bannerCropFileName.replace(/\.[^.]+$/, '') || 'banner';

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, outputType === 'image/png' ? undefined : 0.92);
    });

    if (!blob) {
      toast.error('Falha ao gerar recorte do banner');
      return;
    }

    const croppedFile = new File([blob], `${baseName}-recorte.${extension}`, { type: outputType });
    await uploadBannerFile(croppedFile, 'Banner recortado e enviado com sucesso!');
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

          <div>
            <Label htmlFor="serviceHours">Horário de Atendimento</Label>
            <Input
              id="serviceHours"
              value={serviceHours}
              onChange={(e) => setServiceHours(e.target.value)}
              placeholder="Seg-Sex: 9h às 18h | Sáb: 9h às 13h"
              className="mt-1.5"
            />
            <p className="text-sm text-neutral-500 mt-1">
              Esse texto aparece no rodapé da loja.
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
                src={logoUrl || 'https://placehold.co/200x200?text=Logo'}
                alt="Logo"
                className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200"
              />
              <div className="flex-1">
                <input
                  id="store-logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('store-logo-upload')?.click()}
                  disabled={isUploadingLogo}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingLogo ? 'Enviando...' : 'Fazer Upload'}
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
                src={bannerUrl || 'https://placehold.co/1200x400?text=Banner'}
                alt="Banner"
                className="w-full h-40 rounded-xl object-cover border-2 border-neutral-200"
              />
              <div className="mt-3">
                <input
                  id="store-banner-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    handleBannerUpload(e.target.files?.[0]);
                    e.currentTarget.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('store-banner-upload')?.click()}
                  disabled={isUploadingBanner}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingBanner ? 'Enviando...' : 'Fazer Upload'}
                </Button>
                <p className="text-sm text-neutral-500 mt-2">
                  Recomendado: 1200x400px, formato PNG ou JPG (com opção de recorte)
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

      <Dialog
        open={isBannerCropOpen}
        onOpenChange={(open) => {
          setIsBannerCropOpen(open);
          if (!open) {
            setBannerCropSource('');
            setBannerCropOriginalFile(null);
            setBannerCropImage(null);
            setBannerCropZoom(1);
            setBannerCropPanX(0);
            setBannerCropPanY(0);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Recortar Banner</DialogTitle>
            <DialogDescription>
              Ajuste o enquadramento antes de enviar. Tamanho final: 1200x400.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="w-full rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900">
              <canvas
                ref={bannerPreviewCanvasRef}
                width={BANNER_OUTPUT_WIDTH}
                height={BANNER_OUTPUT_HEIGHT}
                className="w-full h-auto block"
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label>Zoom</Label>
                <Slider
                  value={[bannerCropZoom]}
                  min={1}
                  max={3}
                  step={0.01}
                  onValueChange={(value) => setBannerCropZoom(value[0] || 1)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Posição Horizontal</Label>
                <Slider
                  value={[bannerCropPanX]}
                  min={-1}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => setBannerCropPanX(value[0] || 0)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Posição Vertical</Label>
                <Slider
                  value={[bannerCropPanY]}
                  min={-1}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => setBannerCropPanY(value[0] || 0)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleUploadOriginalBanner} disabled={isUploadingBanner || !bannerCropOriginalFile}>
              Usar Original
            </Button>
            <Button onClick={handleCropAndUploadBanner} disabled={isUploadingBanner || !bannerCropImage}>
              {isUploadingBanner ? 'Enviando...' : 'Aplicar Recorte e Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
