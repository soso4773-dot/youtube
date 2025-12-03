import React, { useState } from 'react';
import { AppStep, AnalysisResult, SuggestedTopic } from './types';
import { analyzeScript, generateNewScriptStream } from './services/geminiService';
import Hero from './components/Hero';
import InputSection from './components/InputSection';
import AnalysisDisplay from './components/AnalysisDisplay';
import ScriptResult from './components/ScriptResult';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SuggestedTopic | null>(null);
  const [scriptContent, setScriptContent] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (inputScript: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeScript(inputScript);
      setAnalysis(result);
      setStep(AppStep.ANALYSIS);
    } catch (e) {
      console.error(e);
      setError("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (topic: SuggestedTopic) => {
    if (!analysis) return;
    
    setSelectedTopic(topic);
    setStep(AppStep.GENERATION);
    setScriptContent('');
    setIsStreaming(true);
    setError(null);

    try {
      const stream = await generateNewScriptStream(topic.title, analysis);
      
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setScriptContent(fullContent);
      }
    } catch (e) {
      console.error(e);
      setError("대본 생성 중 오류가 발생했습니다.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setAnalysis(null);
    setSelectedTopic(null);
    setScriptContent('');
    setError(null);
  };

  const handleRegenerate = () => {
    if (selectedTopic) {
      handleGenerate(selectedTopic);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-200 selection:bg-brand-500/30 selection:text-brand-200 overflow-x-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
            {/* Header / Nav */}
            <nav className="flex justify-between items-center mb-8 md:mb-12">
                <div className="text-2xl font-bold tracking-tighter text-white flex items-center">
                    <span className="text-brand-500 mr-2">✦</span>
                    TubeGenius
                </div>
                {step !== AppStep.INPUT && (
                    <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white">
                        새 프로젝트
                    </button>
                )}
            </nav>

            {/* Error Message */}
            {error && (
                <div className="max-w-xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-center">
                    {error}
                </div>
            )}

            {/* Content Area */}
            <main className="w-full">
                {step === AppStep.INPUT && (
                    <>
                        <Hero />
                        <InputSection onAnalyze={handleAnalyze} isAnalyzing={isLoading} />
                    </>
                )}

                {step === AppStep.ANALYSIS && analysis && (
                    <div className="animate-fade-in">
                        <AnalysisDisplay 
                            analysis={analysis} 
                            onSelectTopic={handleGenerate}
                            isGenerating={isStreaming}
                        />
                    </div>
                )}

                {step === AppStep.GENERATION && selectedTopic && (
                    <ScriptResult 
                        topic={selectedTopic.title}
                        content={scriptContent}
                        isStreaming={isStreaming}
                        onReset={() => setStep(AppStep.ANALYSIS)}
                        onRegenerate={handleRegenerate}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="mt-20 text-center text-slate-600 text-sm py-8 border-t border-slate-800/50">
                <p>© {new Date().getFullYear()} TubeGenius. Powered by Google Gemini.</p>
            </footer>
        </div>
    </div>
  );
};

export default App;