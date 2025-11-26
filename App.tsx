
import React, { useState } from 'react';
import { Activity, Brain, User, AlertCircle, Play, RefreshCw, Hand, BarChart3, Database, ChevronRight } from 'lucide-react';
import { PatientData, Gender, InjuryMechanism, PredictionResult } from './types';
import { analyzePatientRisk, analyzeBatch } from './services/geminiService';
import { ToggleButton } from './components/ToggleButton';
import { ResultCard } from './components/ResultCard';
import { PerformanceMetrics } from './components/PerformanceMetrics';

const initialPatientData: PatientData = {
  age: 30,
  gender: Gender.Male,
  injuryMechanism: InjuryMechanism.FallOnOutstretchedHand,
  hoursSinceInjury: 2,
  snuffboxTenderness: false,
  tubercleTenderness: false,
  thumbCompressionPain: false,
  ulnarDeviationPain: false,
  swelling: false,
  gripStrengthLoss: false,
};

type ViewMode = 'single' | 'training' | 'batch';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Batch State
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const handleInputChange = <K extends keyof PatientData>(key: K, value: PatientData[K]) => {
    setPatientData(prev => ({ ...prev, [key]: value }));
  };

  const generateSyntheticData = () => {
    const isFractureScenario = Math.random() > 0.5;
    const newAge = Math.floor(Math.random() * (65 - 16) + 16);
    const mechanism = Math.random() > 0.3 ? InjuryMechanism.FallOnOutstretchedHand : InjuryMechanism.SportsInjury;
    
    // Correlate symptoms with the scenario
    const baseProb = isFractureScenario ? 0.8 : 0.2;
    
    setPatientData({
      age: newAge,
      gender: Math.random() > 0.5 ? Gender.Male : Gender.Female,
      injuryMechanism: mechanism,
      hoursSinceInjury: Math.floor(Math.random() * 48) + 1,
      snuffboxTenderness: Math.random() < baseProb,
      tubercleTenderness: Math.random() < (isFractureScenario ? 0.7 : 0.3),
      thumbCompressionPain: Math.random() < (isFractureScenario ? 0.6 : 0.2),
      ulnarDeviationPain: Math.random() < (isFractureScenario ? 0.5 : 0.2),
      swelling: Math.random() < (isFractureScenario ? 0.6 : 0.2),
      gripStrengthLoss: Math.random() < (isFractureScenario ? 0.8 : 0.4),
    });
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await analyzePatientRisk(patientData);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const runBatchAnalysis = async () => {
    setBatchLoading(true);
    try {
        const results = await analyzeBatch(5);
        setBatchResults(results);
    } catch (e) {
        console.error(e);
    } finally {
        setBatchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-30 transition-all duration-300">
        <div className="p-4 lg:p-6 flex items-center gap-3 text-white font-bold text-xl border-b border-slate-800">
            <Brain className="w-8 h-8 text-blue-500" />
            <span className="hidden lg:block">ScaphoidAI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setViewMode('single')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode === 'single' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
            >
                <Activity className="w-5 h-5" />
                <span className="hidden lg:block font-medium">Assessment</span>
            </button>
            <button 
                onClick={() => setViewMode('training')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode === 'training' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
            >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden lg:block font-medium">Model Stats</span>
            </button>
            <button 
                onClick={() => setViewMode('batch')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode === 'batch' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
            >
                <Database className="w-5 h-5" />
                <span className="hidden lg:block font-medium">Batch Test</span>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-lg p-3 text-xs">
                <p className="font-semibold text-white mb-1">Model Version</p>
                <p className="font-mono">Gemini-2.5-Flash</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
        
        {viewMode === 'single' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Patient Assessment</h1>
                        <p className="text-slate-500">Enter clinical signs to estimate fracture probability.</p>
                    </div>
                    <button 
                        onClick={generateSyntheticData}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Load Synthetic Patient
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Input Form */}
                <div className="lg:col-span-7 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
                    
                    {/* Demographics */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" /> Demographics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                            <input
                            type="number"
                            value={patientData.age}
                            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            min="0" max="120"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select
                            value={patientData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value as Gender)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            >
                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Injury Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Injury Details
                        </h3>
                        <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mechanism</label>
                            <select
                            value={patientData.injuryMechanism}
                            onChange={(e) => handleInputChange('injuryMechanism', e.target.value as InjuryMechanism)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            >
                            {Object.values(InjuryMechanism).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hours Since Injury</label>
                            <input
                            type="number"
                            value={patientData.hoursSinceInjury}
                            onChange={(e) => handleInputChange('hoursSinceInjury', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            min="0"
                            />
                        </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Clinical Signs */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Hand className="w-4 h-4" /> Clinical Signs
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleButton 
                            label="Snuffbox Tenderness" 
                            checked={patientData.snuffboxTenderness} 
                            onChange={(v) => handleInputChange('snuffboxTenderness', v)} 
                        />
                        <ToggleButton 
                            label="Tubercle Tenderness" 
                            checked={patientData.tubercleTenderness} 
                            onChange={(v) => handleInputChange('tubercleTenderness', v)} 
                        />
                        <ToggleButton 
                            label="Compression Pain" 
                            checked={patientData.thumbCompressionPain} 
                            onChange={(v) => handleInputChange('thumbCompressionPain', v)} 
                        />
                        <ToggleButton 
                            label="Ulnar Deviation Pain" 
                            checked={patientData.ulnarDeviationPain} 
                            onChange={(v) => handleInputChange('ulnarDeviationPain', v)} 
                        />
                        <ToggleButton 
                            label="Visible Swelling" 
                            checked={patientData.swelling} 
                            onChange={(v) => handleInputChange('swelling', v)} 
                        />
                        <ToggleButton 
                            label="Grip Loss" 
                            checked={patientData.gripStrengthLoss} 
                            onChange={(v) => handleInputChange('gripStrengthLoss', v)} 
                        />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4">
                        <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1
                            ${loading 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
                            }
                        `}
                        >
                        {loading ? (
                            <>
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                            </>
                        ) : (
                            <>
                            <Play className="w-5 h-5 fill-current" />
                            Calculate Risk
                            </>
                        )}
                        </button>
                    </div>

                    </form>
                </div>

                {/* Output / Results */}
                <div className="lg:col-span-5 space-y-6">
                    {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                    )}

                    {!result && !loading && !error && (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                        <Activity className="w-16 h-16 mb-4 opacity-10" />
                        <h3 className="text-lg font-semibold text-slate-500">Ready to Analyze</h3>
                        <p className="max-w-xs mx-auto mt-2">Enter the patient's demographics and clinical signs to receive a fracture probability estimate.</p>
                    </div>
                    )}

                    {result && <ResultCard result={result} />}
                </div>

                </div>
            </div>
        )}

        {viewMode === 'training' && (
            <div className="max-w-5xl mx-auto animate-fade-in-up">
                <PerformanceMetrics />
            </div>
        )}

        {viewMode === 'batch' && (
             <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Batch Analysis (Simulation)</h1>
                        <p className="text-slate-500">Generate synthetic patients and test the model in real-time.</p>
                    </div>
                    <button 
                        onClick={runBatchAnalysis}
                        disabled={batchLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        {batchLoading ? 'Generating...' : 'Run Batch Test (n=5)'}
                    </button>
                 </div>

                 {batchResults.length > 0 ? (
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-600">Patient Profile</th>
                                        <th className="p-4 font-semibold text-slate-600">Key Symptoms</th>
                                        <th className="p-4 font-semibold text-slate-600">Risk Level</th>
                                        <th className="p-4 font-semibold text-slate-600 text-right">Probability</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {batchResults.map((res, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900">{res.age}y {res.gender}</div>
                                                <div className="text-slate-500 text-xs truncate max-w-[150px]">{res.injuryMechanism}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {res.snuffboxTenderness && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">ASBT</span>}
                                                    {res.tubercleTenderness && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">STT</span>}
                                                    {!res.snuffboxTenderness && !res.tubercleTenderness && <span className="text-slate-400 text-xs italic">No specific tenderness</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    res.result.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                                    res.result.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {res.result.riskLevel}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-mono font-medium text-slate-700">
                                                {res.result.probability}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                     </div>
                 ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                        <Database className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">No Data Generated</h3>
                        <p className="text-slate-500">Click "Run Batch Test" to generate synthetic patient data and classify it.</p>
                    </div>
                 )}
             </div>
        )}
      </main>
    </div>
  );
};

export default App;
