import React from 'react';
import { AnalysisResult, SuggestedTopic } from '../types';

interface AnalysisDisplayProps {
  analysis: AnalysisResult;
  onSelectTopic: (topic: SuggestedTopic) => void;
  isGenerating: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, onSelectTopic, isGenerating }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">분석 결과</h2>
        <p className="text-slate-400">당신의 대본 스타일을 기반으로 추천 주제를 선택하세요</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-dark-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-brand-400 font-semibold mb-2">스타일</h3>
          <p className="text-slate-300 text-sm">{analysis.styleSummary}</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-brand-400 font-semibold mb-2">타겟 청중</h3>
          <p className="text-slate-300 text-sm">{analysis.targetAudience}</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-brand-400 font-semibold mb-2">톤</h3>
          <p className="text-slate-300 text-sm">{analysis.tone}</p>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">추천 주제</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {analysis.topics.map((topic, idx) => (
            <div
              key={idx}
              className="bg-dark-card rounded-xl p-6 border border-slate-700/50 hover:border-brand-500/50 transition-all cursor-pointer group"
              onClick={() => !isGenerating && onSelectTopic(topic)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-brand-400 font-bold text-lg">#{idx + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">바이럴 스코어</span>
                  <span className="text-brand-500 font-bold text-xl">{topic.viralScore}</span>
                </div>
              </div>
              <h4 className="text-white font-bold text-lg mb-3 group-hover:text-brand-400 transition-colors">
                {topic.title}
              </h4>
              <p className="text-slate-400 text-sm mb-4">{topic.reasoning}</p>
              <button
                disabled={isGenerating}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                {isGenerating ? '생성 중...' : '대본 생성하기'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
