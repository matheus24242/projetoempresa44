import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  History, 
  Package, 
  LayoutDashboard, 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  LogOut,
  FileText,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { Product, Sale } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import SalesHistory from './components/SalesHistory';
import ProductManager from './components/ProductManager';
import CustomerArea from './components/CustomerArea';
import Reports from './components/Reports';
import PricingCalculator from './components/PricingCalculator';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

type View = 'dashboard' | 'pos' | 'history' | 'products' | 'customers' | 'reports' | 'pricing';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mtech_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('mtech_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mtech_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mtech_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (!session) {
          localStorage.removeItem('mtech_products');
          localStorage.removeItem('mtech_sales');
          setProducts([]);
          setSales([]);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (!session) {
          localStorage.removeItem('mtech_products');
          localStorage.removeItem('mtech_sales');
          setProducts([]);
          setSales([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    setDbError(null);
    if (supabase) {
      try {
        const { data: productsData, error: pError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name');
          
        const { data: salesData, error: sError } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', session.user.id)
          .order('timestamp', { ascending: false });
        
        if (pError) throw pError;
        if (sError) throw sError;
        
        // Only update if we actually got something from Supabase
        // This prevents clearing local storage if the connection is flaky
        if (productsData) {
          // Map products and handle potential naming variations
          const mappedProducts: Product[] = productsData.map(p => ({
            ...p,
            user_id: p.user_id || p.userid
          }));
          setProducts(mappedProducts);
        }
        
        if (salesData) {
          // Map DB columns to camelCase for the App
          // Using lowercase names as seen in the user's Supabase screenshot
          const mappedSales: Sale[] = salesData.map(s => ({
            id: s.id,
            productId: s.productid || s.product_id,
            productName: s.productname || s.product_name,
            sku: s.sku,
            quantity: s.quantity,
            totalPrice: s.totalprice || s.total_price,
            channel: s.channel,
            timestamp: s.timestamp || s.created_at,
            customerName: s.customername || s.customer_name,
            user_id: s.user_id || s.userid
          }));
          setSales(mappedSales);
        }
      } catch (error: any) {
        console.error('Supabase fetch error:', error);
        setDbError(error.message);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleAddSale = async (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
    if (!session?.user?.id) {
      alert('Você precisa estar logado para registrar uma venda.');
      return;
    }

    if (!supabase) {
      alert('O sistema está em modo offline ou o Supabase não foi configurado. Verifique as variáveis de ambiente.');
      return;
    }

    // Map camelCase from App to DB columns
    // Using lowercase names as seen in the user's Supabase screenshot
    const newSale: any = {
      productid: saleData.productId,
      productname: saleData.productName,
      sku: saleData.sku,
      quantity: saleData.quantity,
      totalprice: saleData.totalPrice,
      channel: saleData.channel,
      customername: saleData.customerName || null,
      user_id: session.user.id,
    };

    // Try to use ISO string, but we'll also provide a SQL fix for the user
    // because their database column seems to be 'bigint' instead of 'timestamptz'
    newSale.timestamp = new Date().toISOString();

    console.log('Tentando registrar venda:', newSale);

    try {
      // Insert sale and get the generated ID
      const { data: insertedSale, error: saleError } = await supabase
        .from('sales')
        .insert([newSale])
        .select()
        .single();

      if (saleError) {
        console.error('Erro detalhado do Supabase (Venda):', saleError);
        throw new Error(`Erro no banco de dados: ${saleError.message} (${saleError.code})`);
      }

      // Update stock in Supabase
      const product = products.find(p => p.id === saleData.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - saleData.quantity);
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', product.id)
          .eq('user_id', session.user.id);
          
        if (stockError) {
          console.error('Erro ao atualizar estoque:', stockError);
          // Não lançamos erro aqui para não cancelar a venda que já foi inserida, 
          // mas avisamos o usuário
          alert('Venda registrada, mas houve um erro ao atualizar o estoque no banco.');
        }

        // Update local state regardless of DB stock update success (to keep UI in sync)
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, stock: newStock } : p
        ));
      }

      if (insertedSale) {
        // Map back to camelCase for local state
        const mappedSale: Sale = {
          id: insertedSale.id,
          productId: insertedSale.productid || insertedSale.product_id,
          productName: insertedSale.productname || insertedSale.product_name,
          sku: insertedSale.sku,
          quantity: insertedSale.quantity,
          totalPrice: insertedSale.totalprice || insertedSale.total_price,
          channel: insertedSale.channel,
          timestamp: insertedSale.timestamp || insertedSale.created_at,
          customerName: insertedSale.customername || insertedSale.customer_name,
          user_id: insertedSale.user_id || insertedSale.userid
        };
        setSales(prev => [mappedSale, ...prev]);
      }
    } catch (error: any) {
      console.error('Erro completo na função handleAddSale:', error);
      alert('Erro ao registrar venda: ' + error.message);
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (!session?.user?.id || !supabase) return;

    const newProduct = {
      ...productData,
      user_id: session.user.id,
    };

    try {
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;
      
      if (insertedProduct) {
        setProducts(prev => [...prev, insertedProduct].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error: any) {
      console.error('Supabase product insert error:', error);
      alert('Erro ao salvar produto: ' + error.message);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    if (!session?.user?.id || !supabase) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          sku: product.sku,
          name: product.name,
          price: product.price,
          stock: product.stock
        })
        .eq('id', product.id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } catch (error: any) {
      console.error('Supabase product update error:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!session?.user?.id || !supabase) return;

    try {
      // 1. Primeiro tentamos remover as vendas associadas a este produto
      const { error: salesError } = await supabase
        .from('sales')
        .delete()
        .or(`productid.eq.${productId},product_id.eq.${productId}`)
        .eq('user_id', session.user.id);

      if (salesError) throw salesError;
      
      // 2. Agora excluímos o produto
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', session.user.id);
      
      if (productError) throw productError;

      // Atualiza o estado local
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSales(prev => prev.filter(s => s.productId !== productId));
    } catch (error: any) {
      console.error('Supabase product delete error:', error);
      alert('Não foi possível excluir: ' + error.message);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Ponto de Venda', icon: ShoppingCart },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'customers', label: 'Clientes', icon: User },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'pricing', label: 'Precificação', icon: Calculator },
  ];

  if (isLoading && session) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium animate-pulse">Carregando MTech Sistemas da Informação...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-zinc-900 leading-tight">MTech Sistemas da Informação</h1>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            <div className="px-4 py-2 mb-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Menu Principal</p>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeView === item.id 
                    ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <div className="px-4 py-3 mb-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Usuário Logado</p>
              <p className="text-xs font-bold text-zinc-900 truncate">{session?.user?.email}</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-2xl mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Status do Banco</p>
                <button 
                  onClick={() => fetchData()}
                  className="p-1 hover:bg-zinc-200 rounded-md transition-colors"
                  title="Atualizar dados"
                >
                  <History className="w-3 h-3 text-zinc-500" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${supabase ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <p className="text-xs font-medium text-zinc-700">{supabase ? 'Supabase Online' : 'Modo Offline'}</p>
              </div>
            </div>
            <button 
              onClick={() => supabase?.auth.signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900 w-48 md:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-zinc-200 mx-1 md:mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 p-1 md:p-2 rounded-xl transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-900">Olá {session?.user?.email?.split('@')[0] || 'Matheus'}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">{getGreeting()}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                <User className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
            {dbError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Erro de Conexão com o Banco</p>
                  <p className="opacity-80">{dbError}</p>
                </div>
              </div>
            )}
            {activeView === 'dashboard' && (
              <Dashboard 
                sales={sales} 
                products={products} 
                onQuickSale={handleAddSale} 
              />
            )}
            {activeView === 'pos' && <POS products={products} onSale={handleAddSale} />}
            {activeView === 'history' && <SalesHistory sales={sales} />}
            {activeView === 'products' && (
              <ProductManager 
                products={products} 
                onAddProduct={handleAddProduct} 
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
            {activeView === 'customers' && <CustomerArea sales={sales} />}
            {activeView === 'reports' && <Reports sales={sales} />}
            {activeView === 'pricing' && <PricingCalculator />}
          </div>
        </div>
      </main>
    </div>
  );
}
