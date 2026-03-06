import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { useStore } from '../../contexts/StoreContext';
import { Category, ProductVariation } from '../../types';
import { createAdminProduct, fetchAdminCategories, fetchAdminProduct, fetchProduct, updateAdminProduct } from '../../services/storefront';

export function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { store, storeID } = useStore();
  const baseAdminPath = `/stores/id/${storeID}/admin`;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState(true);
  const [variations, setVariations] = useState<ProductVariation[]>([
    { id: 1, color: '', size: '', stock: 0 },
  ]);

  useEffect(() => {
    if (!store) return;
    fetchAdminCategories(store.id).then(setCategories).catch(() => setCategories([]));
  }, [store]);

  useEffect(() => {
    if (!store || !id) return;
    const productId = Number(id);
    if (!productId) return;

    fetchAdminProduct(store.id, productId)
      .then(async (p) => {
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
        setDiscountPrice(String(p.discountPrice || ''));
        setCategoryId(String(p.categoryId));
        setStatus(p.status === 'active');

        const fullProduct = await fetchProduct(store.id, p.slug);
        setVariations(fullProduct.variations.length ? fullProduct.variations : [{ id: 1, color: '', size: '', stock: 0 }]);
      })
      .catch(() => toast.error('Não foi possível carregar o produto'));
  }, [store, id]);

  if (!store) {
    return <div className="p-6">Carregando...</div>;
  }

  const handleAddVariation = () => {
    setVariations([...variations, { id: Date.now(), color: '', size: '', stock: 0 }]);
  };

  const handleRemoveVariation = (variationId: number) => {
    setVariations(variations.filter((v) => v.id !== variationId));
  };

  const handleVariationChange = (
    variationId: number,
    field: 'color' | 'size' | 'stock',
    value: string | number
  ) => {
    setVariations(
      variations.map((v) => (v.id === variationId ? { ...v, [field]: value } : v))
    );
  };

  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const basePayload = {
      category_id: Number(categoryId),
      name,
      description,
      short_description: description,
      price: Number(price),
      discount_price: Number(discountPrice || 0),
      is_featured: false,
      is_active: status,
      variants: variations.map((v) => ({
        sku: v.sku,
        color: v.color,
        size: v.size,
        stock: v.stock,
      })),
    };

    try {
      if (isEditing && id) {
        await updateAdminProduct(store.id, Number(id), basePayload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await createAdminProduct({ store_id: store.id, ...basePayload });
        toast.success('Produto criado com sucesso!');
      }
      navigate(`${baseAdminPath}/products`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <button
          onClick={() => navigate(`${baseAdminPath}/products`)}
          className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para produtos
        </button>
        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        <p className="text-neutral-600">
          {isEditing ? 'Atualize as informações do produto' : 'Adicione um novo produto ao catálogo'}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Camiseta Premium Cotton"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o produto..."
                rows={4}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="discountPrice">Preço com Desconto</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="status">Status do Produto</Label>
                <p className="text-sm text-neutral-500">
                  {status ? 'Produto visível na loja' : 'Produto oculto da loja'}
                </p>
              </div>
              <Switch id="status" checked={status} onCheckedChange={setStatus} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagens do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-sm text-neutral-600 mb-2">
                Arraste imagens ou clique para fazer upload
              </p>
              <p className="text-xs text-neutral-500">PNG, JPG até 5MB</p>
              <Button variant="outline" className="mt-4">
                Selecionar Imagens
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Variações de Produto</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddVariation}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Variação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variations.map((variation) => (
                <div
                  key={variation.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <Label>Cor</Label>
                    <Input
                      value={variation.color}
                      onChange={(e) =>
                        handleVariationChange(variation.id, 'color', e.target.value)
                      }
                      placeholder="Ex: Preto"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Tamanho</Label>
                    <Input
                      value={variation.size}
                      onChange={(e) =>
                        handleVariationChange(variation.id, 'size', e.target.value)
                      }
                      placeholder="Ex: M"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Estoque</Label>
                    <Input
                      type="number"
                      value={variation.stock}
                      onChange={(e) =>
                        handleVariationChange(variation.id, 'stock', parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVariation(variation.id)}
                      disabled={variations.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(`${baseAdminPath}/products`)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Atualizar Produto' : 'Criar Produto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
