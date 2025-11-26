import React from 'react';
import { PredictionResult } from '../types';
import { AlertTriangle, CheckCircle, Activity, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultCardProps {
  result: PredictionResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const getColor = (level: string) => {
    switch (level) {
      case 'High': return '#ef4444'; // Red-500
      case 'Moderate': return '#f59e0b'; // Amber-500
      default: return '#10b981'; // Emerald-500
    }
  };

  const color = getColor(result.riskLevel);
  
  const chartData = [
    { name: 'Probability', value: result.probability },
    { name: 'Remaining', value: 100 - result.probability },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
      <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Analysis Result
          </h2>
          <p className="text-slate-400 text-sm mt-1">AI-Estimated Probability</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase bg-opacity-20 border border-opacity-30`}
             style={{ backgroundColor: color, borderColor: color, color: color === '#ef4444' ? '#fca5a5' : color === '#f59e0b' ? '#fcd34d' : '#6ee7b7' }}>
          {result.riskLevel} Risk
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Gauge Section */}
          <div className="flex flex-col items-center justify-center md:w-1/3 min-w-[200px]">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill={color} />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-4xl font-bold text-slate-800">{result.probability}%</span>
                <span className="text-xs text-slate-500 font-medium">Fracture Prob.</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-slate-900 font-semibold flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                Clinical Reasoning
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                {result.reasoning}
              </p>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold flex items-center gap-2 mb-2">
                {result.riskLevel === 'High' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                Recommendation
              </h3>
              <div className={`p-4 rounded-lg border-l-4 ${
                result.riskLevel === 'High' ? 'bg-red-50 border-red-500 text-red-800' :
                result.riskLevel === 'Moderate' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                'bg-emerald-50 border-emerald-500 text-emerald-800'
              }`}>
                <p className="font-medium">{result.recommendation}</p>
                {result.clinicalRuleReference && (
                    <p className="text-xs mt-2 opacity-80">Ref: {result.clinicalRuleReference}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
