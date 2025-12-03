import React from 'react';

interface ScriptResultProps {
  topic: string;
  content: string;
  isStreaming: boolean;
  onReset: () => void;
  onRegenerate: () => void;
}

const ScriptResult: React.FC<ScriptResultProps> = ({ 
  topic, 
  content, 
  isStreaming, 
  onReset, 
  onRegenerate 
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">생성된 대본</h2>
        <p className="text-brand-400 text-lg font-semibold">{topic}</p>
      </div>

      <div className="bg-dark-card rounded-2xl p-6 md:p-8 border border-slate-700/50 mb-6">
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-brand-500 animate-pulse ml-1" />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={copyToClipboard}
          disabled={isStreaming || !content}
          className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
        >
          📋 복사하기
        </button>
        <button
          onClick={onRegenerate}
          disabled={isStreaming}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
        >
          🔄 다시 생성하기
        </button>
        <button
          onClick={onReset}
          disabled={isStreaming}
          className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
        >
          ← 주제 선택으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default ScriptResult;
