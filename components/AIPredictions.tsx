
import React, { useEffect, useState } from 'react';
import { InventoryItem, AIInsights } from '../types';
import { getNovaLitePredictions } from '../lib/bedrock';

interface AIPredictionsProps {
  inventory: InventoryItem[];
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ inventory }) => {
  const [insights, setInsights] = useState<Record<number, AIInsights>>({});
  const [loading, setLoading] = useState(true);

  const modelId = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const data: Record<number, AIInsights> = {};
      await Promise.all(inventory.map(async (item) => {
        const res = await getNovaLitePredictions(item);
        data[item.id] = res;
      }));
      setInsights(data);
      setLoading(false);
    };
    fetchAll();
  }, [inventory]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Invoking Bedrock Model: {modelId}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bedrock Intelligence Panel</h2>
          <p className="text-xs text-slate-500 font-medium">Model Identification: <code className="bg-slate-100 px-1 py-0.5 rounded">{modelId}</code></p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black px-2 py-1 bg-[#FF9900] text-[#232F3E] rounded uppercase tracking-tighter shadow-sm">Real-time Inference</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => {
          const insight = insights[item.id];
          return (
            <div key={item.id} className={`bg-white rounded border-l-4 ${insight?.low_stock_alert ? 'border-l-[#FF9900]' : 'border-l-slate-400'} border-y border-r border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 transition-colors">{item.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU_ID: {item.id.toString().padStart(5, '0')}</p>
                </div>
                {insight?.low_stock_alert && (
                  <div className="bg-[#FF9900]/10 p-1.5 rounded">
                    <span className="text-[#FF9900] font-bold text-xs">REPLENISH</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#F2F3F3] p-3 rounded-sm border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Projected Exhaustion</p>
                  <p className="text-xl font-black text-[#232F3E]">{insight?.restock_in_days} Days</p>
                </div>
                <div className="bg-[#F2F3F3] p-3 rounded-sm border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">30D Forecast</p>
                  <p className="text-xl font-black text-blue-700">{insight?.predicted_sales_next_month} Unit</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] font-black text-[#FF9900] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-[#FF9900] rounded-full"></span> Bedrock Analysis Output
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                    "{insight?.explanation}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIPredictions;
