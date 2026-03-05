import React, { useState, useRef, useEffect } from 'react';
import { Product, Sale, SaleChannel } from '../types';
import { Barcode, Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, X } from 'lucide-react';

interface POSProps {
  products: Product[];
  onSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;
}

export default function POS({ products, onSale }: POSProps) {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [skuInput, setSkuInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [channel, setChannel] = useState<SaleChannel>('personal');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input
  useEffect(() => {
    if (!isCartOpen) {
      inputRef.current?.focus();
    }
  }, [isCartOpen]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSkuInput('');
    inputRef.current?.focus();
  };

  const handleSkuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku.toLowerCase() === skuInput.toLowerCase());
    if (product) {
      addToCart(product);
    } else {
      alert('Produto não encontrado!');
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    cart.forEach(item => {
      onSale({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
        channel: channel,
        customerName: customerName
      });
    });

    setCart([]);
    setCustomerName('');
    setIsCartOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Product Selection */}
        <div className="lg:col-span-2 flex flex-col space-y-4 md:space-y-6 overflow-hidden">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
            <form onSubmit={handleSkuSubmit} className="relative">
              <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Escaneie ou digite o SKU..."
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none font-mono text-sm md:text-base"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
              />
            </form>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-100 flex-1 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold">Catálogo</h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar produto..." 
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 overflow-y-auto pr-1">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-3 md:p-4 border border-zinc-100 rounded-xl hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left group active:scale-95"
                >
                  <p className="text-[10px] font-mono text-zinc-400 mb-1 truncate">{product.sku}</p>
                  <p className="font-medium text-zinc-900 line-clamp-2 mb-2 text-sm md:text-base h-10 md:h-12">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base md:text-lg font-bold text-zinc-900">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <span className={`text-[10px] font-bold ${product.stock < 10 ? 'text-red-500' : 'text-zinc-400'}`}>
                      Qtd: {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart - Desktop Sidebar / Mobile Modal */}
        <div className={`
          fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-auto
          bg-white lg:bg-transparent
          flex flex-col h-full overflow-hidden
          transition-transform duration-300 lg:translate-x-0
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-zinc-900" />
                  <h3 className="text-lg font-semibold">Carrinho</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <div className="flex p-1 bg-zinc-100 rounded-xl">
                <button
                  onClick={() => setChannel('personal')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
                    channel === 'personal' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  Interna
                </button>
                <button
                  onClick={() => setChannel('shopee')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
                    channel === 'shopee' ? 'bg-white shadow-sm text-orange-600' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  Shopee
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cliente (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Nome do cliente..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between group">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium text-zinc-900 truncate text-sm md:text-base">{item.product.name}</p>
                      <p className="text-xs text-zinc-500">
                        {item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex items-center bg-zinc-50 rounded-lg border border-zinc-200">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1.5 hover:text-zinc-900 text-zinc-400"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 md:w-8 text-center text-xs md:text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1.5 hover:text-zinc-900 text-zinc-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 md:p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between text-zinc-500 text-sm">
                <span>Subtotal</span>
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex items-center justify-between text-lg md:text-xl font-bold text-zinc-900">
                <span>Total</span>
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 md:py-5 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                  cart.length === 0 
                    ? 'bg-zinc-300 cursor-not-allowed' 
                    : channel === 'shopee' ? 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200' : 'bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-200'
                }`}
              >
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center relative active:scale-90 transition-transform"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {cartItemsCount}
            </span>
          )}
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[100]">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">Venda registrada!</span>
        </div>
      )}
    </div>
  );
}
