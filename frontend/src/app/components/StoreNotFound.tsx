interface StoreNotFoundProps {
  storeID: number;
}

export function StoreNotFound({ storeID }: StoreNotFoundProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center bg-white border border-neutral-200 rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-3">Loja não existe</h1>
        <p className="text-neutral-600 mb-6">
          A loja não foi encontrada.
        </p>
      </div>
    </div>
  );
}

