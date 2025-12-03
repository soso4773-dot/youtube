import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-400 via-brand-500 to-blue-500 bg-clip-text text-transparent leading-tight">
        AI로 바이럴 대본 만들기
      </h1>
      <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
        당신의 대본 스타일을 분석하고, 바이럴될 가능성이 높은 새로운 주제를 추천합니다.
      </p>
    </div>
  );
};

export default Hero;
