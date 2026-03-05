import React, { useMemo } from 'react';
import { Sale } from '../types';
import { User, Trophy, ShoppingBag, DollarSign } from 'lucide-react';

interface CustomerAreaProps {
  sales: Sale[];
}

interface CustomerStats {
  name: string;
  totalSpent: number;
  totalOrders: number;
}

export default function CustomerArea({ sales }: CustomerAreaProps) {
  const topCustomers = useMemo(() => {
    const customerMap: Record<string, CustomerStats> = {};

    sales.forEach(sale => {
      const name = sale.customerName?.trim() || 'Cliente Anônimo';
      if (!customerMap[name]) {
        customerMap[name] = { name, totalSpent: 0, totalOrders: 0 };
      }
      customerMap[name].totalSpent += sale.totalPrice;
      customerMap[name].totalOrders += 1;
    });

    return Object.values(customerMap)
      .filter(c => c.name !== 'Cliente Anônimo')
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Área de Clientes</h2>
        </div>
        <p className="text-sm text-zinc-500">Acompanhe seus clientes mais fiéis e seu histórico de compras.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Highlights */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Compradores
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCustomers.slice(0, 4).map((customer, index) => (
              <div key={customer.name} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <User className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-amber-100 text-amber-600' : 
                      index === 1 ? 'bg-zinc-100 text-zinc-600' : 
                      index === 2 ? 'bg-orange-100 text-orange-600' : 
                      'bg-zinc-50 text-zinc-400'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-zinc-900 truncate">{customer.name}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Gasto</p>
                      <p className="text-lg font-bold text-zinc-900">
                        {customer.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Pedidos</p>
                      <p className="text-lg font-bold text-zinc-900">{customer.totalOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <div className="col-span-2 bg-zinc-50 border-2 border-dashed border-zinc-200 p-12 rounded-2xl text-center">
                <p className="text-zinc-400 font-medium">Nenhum cliente registrado ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ranking List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Ranking Geral</h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-4">{index + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{customer.name}</p>
                    <p className="text-[10px] text-zinc-500">{customer.totalOrders} compras</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-zinc-900">
                  {customer.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <p className="text-center text-zinc-400 text-sm py-8">Sem dados para exibir.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
