import React, { useState } from 'react';

interface InputSectionProps {
  onAnalyze: (script: string) => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [inputScript, setInputScript] = useState<string>('');

  const handleSubmit = () => {
    if (inputScript.trim()) {
      onAnalyze(inputScript.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-dark-card rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-8">
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          기존 대본을 입력하세요
        </label>
        <textarea
          className="w-full h-64 bg-dark-input text-slate-200 rounded-xl p-4 border border-slate-600/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none"
          placeholder="여기에 YouTube 대본을 붙여넣으세요..."
          value={inputScript}
          onChange={(e) => setInputScript(e.target.value)}
          disabled={isAnalyzing}
        />
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || !inputScript.trim()}
          className="mt-6 w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-brand-500/50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              분석 중...
            </span>
          ) : (
            '대본 분석하기'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
