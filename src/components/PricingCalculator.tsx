import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Info, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Truck, 
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  Store,
  ShoppingBag,
  Package
} from 'lucide-react';

interface ExtraCost {
  id: string;
  description: string;
  value: number;
}

type PricingMode = 'shopee' | 'internal';

export default function PricingCalculator() {
  const [mode, setMode] = useState<PricingMode>('shopee');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(18); 
  const [fixedFee, setFixedFee] = useState<number>(3); 
  const [taxRate, setTaxRate] = useState<number>(4); 
  const [desiredMargin, setDesiredMargin] = useState<number>(30);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([]);
  const [newExtraDesc, setNewExtraDesc] = useState('');
  const [newExtraValue, setNewExtraValue] = useState<number | ''>('');

  const handleModeChange = (newMode: PricingMode) => {
    setMode(newMode);
    if (newMode === 'internal') {
      setPlatformFee(0);
      setFixedFee(0);
    } else {
      setPlatformFee(18);
      setFixedFee(3);
    }
  };

  const addExtraCost = () => {
    if (newExtraDesc && typeof newExtraValue === 'number') {
      setExtraCosts(prev => [...prev, {
        id: crypto.randomUUID(),
        description: newExtraDesc,
        value: newExtraValue
      }]);
      setNewExtraDesc('');
      setNewExtraValue('');
    }
  };

  const removeExtraCost = (id: string) => {
    setExtraCosts(prev => prev.filter(c => c.id !== id));
  };

  const totalExtraCosts = extraCosts.reduce((acc, c) => acc + c.value, 0);

  const results = useMemo(() => {
    const totalVariableFeesPercent = (platformFee + taxRate + desiredMargin) / 100;
    
    if (totalVariableFeesPercent >= 1) return null;

    const baseCosts = costPrice + fixedFee + shippingCost + totalExtraCosts;
    const sellingPrice = baseCosts / (1 - totalVariableFeesPercent);
    
    const platformFeeAmount = (sellingPrice * platformFee) / 100;
    const taxAmount = (sellingPrice * taxRate) / 100;
    const profitAmount = (sellingPrice * desiredMargin) / 100;
    
    const totalCosts = costPrice + platformFeeAmount + fixedFee + taxAmount + shippingCost + totalExtraCosts;
    const roi = (profitAmount / costPrice) * 100;

    return {
      sellingPrice,
      platformFeeAmount,
      taxAmount,
      profitAmount,
      totalCosts,
      roi: isFinite(roi) ? roi : 0,
      breakEven: baseCosts / (1 - (platformFee + taxRate) / 100)
    };
  }, [costPrice, platformFee, fixedFee, taxRate, desiredMargin, shippingCost, totalExtraCosts]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Calculadora de Precificação</h2>
            <p className="text-sm text-zinc-500">Defina o preço ideal para seus produtos e garanta sua margem de lucro.</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => handleModeChange('shopee')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'shopee' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Shopee
          </button>
          <button
            onClick={() => handleModeChange('internal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'internal' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Store className="w-4 h-4" />
            Venda Interna
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              Custos e Despesas {mode === 'shopee' ? '(Shopee)' : '(Interna)'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Preço de Custo (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                  <input 
                    type="number" 
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={costPrice || ''}
                    onChange={e => setCostPrice(Number(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Margem de Lucro Desejada (%)</label>
                <div className="relative">
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={desiredMargin || ''}
                    onChange={e => setDesiredMargin(Number(e.target.value))}
                    placeholder="Ex: 30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Comissão da Plataforma (%)</label>
                <div className="relative">
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={platformFee || ''}
                    onChange={e => setPlatformFee(Number(e.target.value))}
                    placeholder="Ex: 18"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Imposto sobre Venda (%)</label>
                <div className="relative">
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={taxRate || ''}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    placeholder="Ex: 4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Taxa Fixa por Venda (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                  <input 
                    type="number" 
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={fixedFee || ''}
                    onChange={e => setFixedFee(Number(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Embalagem / Envio (R$)</label>
                <div className="relative">
                  <Truck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={shippingCost || ''}
                    onChange={e => setShippingCost(Number(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Extra Costs Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              Insumos e Gastos Extras
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Ex: Folha A4, Fita, Etiqueta..."
                  className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={newExtraDesc}
                  onChange={e => setNewExtraDesc(e.target.value)}
                />
                <div className="relative md:w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                  <input 
                    type="number" 
                    placeholder="0,00"
                    className="w-full pl-8 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newExtraValue}
                    onChange={e => setNewExtraValue(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <button 
                  onClick={addExtraCost}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {extraCosts.map(cost => (
                  <div key={cost.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-zinc-700">{cost.description}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-zinc-900">
                        {cost.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <button 
                        onClick={() => removeExtraCost(cost.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {extraCosts.length > 0 && (
                  <div className="flex justify-between items-center pt-2 px-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Total Extras</span>
                    <span className="text-sm font-bold text-zinc-900">
                      {totalExtraCosts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 h-full">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Resultado Calculado
            </h3>

            {results ? (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border text-center ${
                  mode === 'shopee' ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'
                }`}>
                  <p className={`text-xs font-bold uppercase mb-1 ${
                    mode === 'shopee' ? 'text-orange-600' : 'text-emerald-600'
                  }`}>Preço de Venda Sugerido</p>
                  <p className={`text-3xl font-black ${
                    mode === 'shopee' ? 'text-orange-700' : 'text-emerald-700'
                  }`}>
                    {results.sellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">Lucro Líquido</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900">
                      {results.profitAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">ROI (Retorno)</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      {results.roi.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">Ponto de Equilíbrio</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900">
                      {results.breakEven.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase">Detalhamento de Taxas</h4>
                  {platformFee > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Comissão ({platformFee}%)</span>
                      <span className="text-zinc-900 font-medium">
                        {results.platformFeeAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Impostos ({taxRate}%)</span>
                    <span className="text-zinc-900 font-medium">
                      {results.taxAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Custos Fixos e Extras</span>
                    <span className="text-zinc-900 font-medium">
                      {(fixedFee + shippingCost + totalExtraCosts).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-400">Insira os valores para calcular o preço ideal.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
