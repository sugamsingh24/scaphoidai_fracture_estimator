import React, { useState } from 'react';
import { Activity, Brain, User, AlertCircle, Play, RefreshCw, Hand } from 'lucide-react';
import { PatientData, Gender, InjuryMechanism, PredictionResult } from './types';
import { analyzePatientRisk } from './services/geminiService';
import { ToggleButton } from './components/ToggleButton';
import { ResultCard } from './components/ResultCard';

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

const App: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = <K extends keyof PatientData>(key: K, value: PatientData[K]) => {
    setPatientData(prev => ({ ...prev, [key]: value }));
  };

  const generateSyntheticData = () => {
    // Generate a "True Fracture" scenario roughly 50% of the time for demo purposes
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
    setResult(null); // Reset result on new data
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">ScaphoidAI</h1>
              <p className="text-xs text-slate-500 font-medium">Fracture Probability Estimator</p>
            </div>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 hidden md:block">
            Documentation
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro / Context */}
        <section className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Clinical Decision Support</h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              This tool uses the Google Gemini API to analyze patient demographics and clinical signs, 
              simulating a trained model to estimate scaphoid fracture probability.
            </p>
            <button 
              onClick={generateSyntheticData}
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Synthetic Patient
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
          <Activity className="absolute -bottom-8 -right-8 w-64 h-64 text-white opacity-10" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
              
              {/* Demographics */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient Demographics
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
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Injury Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mechanism of Injury</label>
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
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Hand className="w-4 h-4" /> Clinical Examination
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
                    label="Thumb Compression Pain" 
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
                    label="Grip Strength Loss" 
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
                      Analyzing with Gemini...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Calculate Fracture Probability
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
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center text-slate-400">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p>Enter patient details and click Calculate to receive an AI-powered risk assessment.</p>
              </div>
            )}

            {result && <ResultCard result={result} />}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
