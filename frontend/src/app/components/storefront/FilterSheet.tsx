import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { mockCategories } from '../../data/mockData';

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export function FilterSheet({
  open,
  onOpenChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
}: FilterSheetProps) {
  const handleReset = () => {
    onCategoryChange(null);
    onPriceRangeChange([0, 500]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">Categorias</h3>
            <div className="space-y-2">
              <button
                onClick={() => onCategoryChange(null)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg transition-colors
                  ${!selectedCategory ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-neutral-100'}
                `}
              >
                Todas
              </button>
              {mockCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.name)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition-colors
                    ${
                      selectedCategory === category.name
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'hover:bg-neutral-100'
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-3">Faixa de Preço</h3>
            <div className="px-2">
              <Slider
                min={0}
                max={500}
                step={10}
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-neutral-600">
                <span>R$ {priceRange[0]}</span>
                <span>R$ {priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Aplicar Filtros
            </Button>
            <Button variant="outline" className="w-full" onClick={handleReset}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
