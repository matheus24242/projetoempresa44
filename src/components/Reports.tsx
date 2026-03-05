import React, { useState, useMemo } from 'react';
import { Sale, SaleChannel } from '../types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Printer, 
  Filter, 
  Calendar, 
  Search, 
  Download,
  TrendingUp,
  ShoppingBag,
  Store
} from 'lucide-react';

interface ReportsProps {
  sales: Sale[];
}

export default function Reports({ sales }: ReportsProps) {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [filterChannel, setFilterChannel] = useState<SaleChannel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);

      const isInDateRange = isWithinInterval(saleDate, { start, end });
      const matchesChannel = filterChannel === 'all' || sale.channel === filterChannel;
      const matchesSearch = sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.sku.toLowerCase().includes(searchTerm.toLowerCase());

      return isInDateRange && matchesChannel && matchesSearch;
    });
  }, [sales, dateRange, filterChannel, searchTerm]);

  const monthlyStats = useMemo(() => {
    const stats: Record<string, { total: number; shopee: number; personal: number; count: number; date: Date }> = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.timestamp);
      const monthKey = format(date, 'MMMM yyyy', { locale: ptBR });
      if (!stats[monthKey]) {
        stats[monthKey] = { 
          total: 0, 
          shopee: 0, 
          personal: 0, 
          count: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1)
        };
      }
      stats[monthKey].total += sale.totalPrice;
      stats[monthKey].count += 1;
      if (sale.channel === 'shopee') stats[monthKey].shopee += sale.totalPrice;
      else stats[monthKey].personal += sale.totalPrice;
    });

    return Object.entries(stats).sort((a, b) => {
      return b[1].date.getTime() - a[1].date.getTime();
    });
  }, [sales]);

  const totalFiltered = filteredSales.reduce((acc, s) => acc + s.totalPrice, 0);

  const handlePrint = () => {
    window.focus();
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Relatórios Detalhados</h2>
            <p className="text-sm text-zinc-500">Analise seu desempenho e exporte dados.</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors font-bold text-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir Relatório
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-4 print:hidden">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Filtros de Busca</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Início</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Fim</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Canal</label>
            <select 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value as any)}
            >
              <option value="all">Todos os Canais</option>
              <option value="shopee">Shopee</option>
              <option value="personal">Interna</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Pesquisar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Produto, SKU, Cliente..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Summary */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Renda Mensal
            </h3>
            <div className="space-y-4">
              {monthlyStats.map(([month, data]) => (
                <div key={month} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-sm font-bold text-zinc-900 capitalize">{month}</p>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-500">
                      {data.count} vendas
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Total</span>
                      <span className="font-bold text-zinc-900">
                        {data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-orange-500 h-full" 
                        style={{ width: `${(data.shopee / data.total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${(data.personal / data.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-orange-600">Shopee: {((data.shopee / data.total) * 100).toFixed(0)}%</span>
                      <span className="text-emerald-600">Interna: {((data.personal / data.total) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtered Results Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Resultados do Filtro</h3>
                <p className="text-xs text-zinc-500">{filteredSales.length} registros encontrados</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Total do Período</p>
                <p className="text-xl font-bold text-zinc-900">
                  {totalFiltered.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Canal</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-600">
                        {format(new Date(sale.timestamp), 'dd/MM/yy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-zinc-900">{sale.productName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{sale.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-600">
                        {sale.customerName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sale.channel === 'shopee' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {sale.channel === 'shopee' ? 'Shopee' : 'Interna'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-zinc-900">
                        {sale.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">
                        Nenhum registro encontrado para os filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400">
        <p>Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        <p>MTech Sistemas da Informação - Sistema de Gestão</p>
      </div>
    </div>
  );
}
