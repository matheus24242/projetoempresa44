import React from 'react';
import { Sale } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingBag, Store, Calendar, Tag, DollarSign, User, Printer } from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
}

export default function SalesHistory({ sales }: SalesHistoryProps) {
  const sortedSales = [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <h3 className="text-lg font-semibold">Histórico de Vendas</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-full">
              <ShoppingBag className="w-3 h-3" /> Shopee
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full">
              <Store className="w-3 h-3" /> Interna
            </span>
          </div>
          <button 
            onClick={() => {
              window.focus();
              setTimeout(() => window.print(), 100);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors font-bold text-xs"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sortedSales.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-zinc-400 border border-zinc-100">
            Nenhuma venda registrada.
          </div>
        ) : (
          sortedSales.map((sale) => (
            <div key={sale.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-900 leading-tight">{sale.productName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <Tag className="w-3 h-3" /> {sale.sku}
                  </div>
                  {sale.customerName && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                      <User className="w-3 h-3" /> {sale.customerName}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  sale.channel === 'shopee' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {sale.channel === 'shopee' ? 'Shopee' : 'Interna'}
                </span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-zinc-50">
                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(sale.timestamp), "dd/MM, HH:mm", { locale: ptBR })}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Total</p>
                  <p className="font-bold text-zinc-900">
                    {sale.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Canal</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sortedSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              ) : (
                sortedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-zinc-900">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        {format(new Date(sale.timestamp), "dd MMM, HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{sale.productName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-600">{sale.customerName || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                        <Tag className="w-3 h-3" />
                        {sale.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sale.channel === 'shopee' 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {sale.channel === 'shopee' ? 'Shopee' : 'Interna'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-zinc-900">
                      {sale.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
