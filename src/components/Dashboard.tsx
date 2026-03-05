import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Sale, Product, SaleChannel } from '../types';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, ShoppingBag, Store, DollarSign, Plus, X, Calendar, User, Printer } from 'lucide-react';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
  onQuickSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;
}

export default function Dashboard({ sales, products, onQuickSale }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickSale, setQuickSale] = useState({
    productId: '',
    quantity: 1,
    channel: 'personal' as SaleChannel,
    customerName: ''
  });

  const shopeeSales = sales.filter(s => s.channel === 'shopee');
  const personalSales = sales.filter(s => s.channel === 'personal');

  const shopeeRevenue = shopeeSales.reduce((acc, s) => acc + s.totalPrice, 0);
  const personalRevenue = personalSales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalRevenue = shopeeRevenue + personalRevenue;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Prepare chart data for last 7 days
  const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'dd/MM', { locale: ptBR });

    const daySales = sales.filter(s => format(new Date(s.timestamp), 'yyyy-MM-dd') === dateStr);
    
    return {
      name: dayLabel,
      shopee: daySales.filter(s => s.channel === 'shopee').reduce((acc, s) => acc + s.totalPrice, 0),
      personal: daySales.filter(s => s.channel === 'personal').reduce((acc, s) => acc + s.totalPrice, 0),
    };
  }), [sales]);

  // Monthly Revenue Data (Last 6 months)
  const monthlyRevenue = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const date = startOfMonth(subMonths(new Date(), 5 - i));
    const monthLabel = format(date, 'MMM/yy', { locale: ptBR });

    const monthSales = sales.filter(s => isSameMonth(new Date(s.timestamp), date));
    
    return {
      name: monthLabel,
      shopee: monthSales.filter(s => s.channel === 'shopee').reduce((acc, s) => acc + s.totalPrice, 0),
      personal: monthSales.filter(s => s.channel === 'personal').reduce((acc, s) => acc + s.totalPrice, 0),
      total: monthSales.reduce((acc, s) => acc + s.totalPrice, 0),
    };
  }), [sales]);

  const pieData = [
    { name: 'Shopee', value: shopeeRevenue, color: '#EE4D2D' },
    { name: 'Interna', value: personalRevenue, color: '#10B981' },
  ];

  const handleQuickSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === quickSale.productId);
    if (!product) return;

    onQuickSale({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: quickSale.quantity,
      totalPrice: product.price * quickSale.quantity,
      channel: quickSale.channel,
      customerName: quickSale.customerName
    });
    setIsModalOpen(false);
    setQuickSale({ productId: '', quantity: 1, channel: 'personal', customerName: '' });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900">Painel de Controle</h2>
          <p className="text-sm text-zinc-500">{getGreeting()}, veja seu faturamento atual da loja.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              window.focus();
              setTimeout(() => window.print(), 100);
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors font-bold text-sm w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Venda Rápida
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-zinc-600" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900">
            {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Faturamento acumulado</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Shopee</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-orange-600">
            {shopeeRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{shopeeSales.length} vendas</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Interna</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-emerald-600">
            {personalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{personalSales.length} vendas</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Vendas</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900">{sales.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Transações totais</p>
        </div>
      </div>

      {/* Monthly Revenue Chart - NEW */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-zinc-900" />
          <h3 className="text-lg font-semibold">Faturamento Mensal (Últimos 6 Meses)</h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" />
              <Line name="Shopee" type="monotone" dataKey="shopee" stroke="#EE4D2D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line name="Interna" type="monotone" dataKey="personal" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line name="Total" type="monotone" dataKey="total" stroke="#18181b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h3 className="text-lg font-semibold mb-6">Faturamento Diário (Últimos 7 dias)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar name="Shopee" dataKey="shopee" fill="#EE4D2D" radius={[4, 4, 0, 0]} />
                <Bar name="Interna" dataKey="personal" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-lg font-semibold mb-6">Distribuição por Canal</h3>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Top Clientes
            </h3>
            <div className="space-y-3">
              {Object.entries(
                sales.reduce((acc, s) => {
                  const name = s.customerName || 'Anônimo';
                  if (name === 'Anônimo') return acc;
                  acc[name] = (acc[name] || 0) + s.totalPrice;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, total], i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400">{i + 1}º</span>
                      <span className="text-xs font-medium text-zinc-700 truncate w-24">{name}</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-900">
                      {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              {sales.filter(s => s.customerName).length === 0 && (
                <p className="text-[10px] text-zinc-400 text-center py-2">Nenhum cliente com nome registrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Registrar Venda Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleQuickSaleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Produto</label>
                <select 
                  required
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                  value={quickSale.productId}
                  onChange={e => setQuickSale({ ...quickSale, productId: e.target.value })}
                >
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Quantidade</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                    value={quickSale.quantity}
                    onChange={e => setQuickSale({ ...quickSale, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Canal</label>
                  <select 
                    required
                    className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                    value={quickSale.channel}
                    onChange={e => setQuickSale({ ...quickSale, channel: e.target.value as SaleChannel })}
                  >
                    <option value="personal">Interna</option>
                    <option value="shopee">Shopee</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Cliente (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Nome do cliente..."
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                  value={quickSale.customerName}
                  onChange={e => setQuickSale({ ...quickSale, customerName: e.target.value })}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all mt-4 mb-6 sm:mb-0"
              >
                Confirmar Venda
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
