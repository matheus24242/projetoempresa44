import React, { useState } from 'react';
import { Product } from '../types';
import { Package, Plus, Search, Edit2, Trash2, Barcode, Box } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductManager({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: ProductManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    price: 0,
    stock: 0
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setNewProduct({ sku: '', name: '', price: 0, stock: 0 });
    setIsAdding(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-zinc-900">Produtos</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors w-full sm:w-auto shadow-lg shadow-zinc-200"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Novo Produto</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">SKU / Código</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nome do Produto</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Preço (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Estoque Inicial</label>
              <input
                required
                type="number"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-zinc-500 hover:text-zinc-700 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Editar Produto</h4>
          <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">SKU / Código</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={editingProduct.sku}
                onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nome do Produto</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={editingProduct.name}
                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Preço (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={editingProduct.price}
                onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Estoque</label>
              <input
                required
                type="number"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                value={editingProduct.stock}
                onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-zinc-500 hover:text-zinc-700 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800"
              >
                Atualizar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar por SKU ou nome..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 divide-y divide-zinc-100 md:hidden">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-zinc-100 rounded-lg shrink-0">
                  <Package className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 truncate text-sm">{product.name}</p>
                  <p className="text-[10px] font-mono text-zinc-400">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="font-bold text-zinc-900 text-sm">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className={`text-[10px] font-bold uppercase ${product.stock < 10 ? 'text-red-500' : 'text-zinc-400'}`}>
                    Estoque: {product.stock}
                  </p>
                </div>
                <button 
                  onClick={() => setEditingProduct(product)}
                  className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Deseja realmente excluir este produto?')) {
                      onDeleteProduct(product.id);
                    }
                  }}
                  className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-100 rounded-lg">
                        <Package className="w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                      <Barcode className="w-3 h-3" />
                      {product.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${product.stock < 10 ? 'text-red-500' : 'text-zinc-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Deseja realmente excluir este produto?')) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
