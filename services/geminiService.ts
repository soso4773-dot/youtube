import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '../types';

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('Gemini API Key is missing!');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeScript(inputScript: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
당신은 YouTube 대본 분석 전문가입니다. 다음 대본을 분석하여 JSON 형식으로 응답해주세요.

**대본:**
${inputScript}

**응답 형식 (JSON만):**
{
  "styleSummary": "작성자의 대본 스타일 요약 (2-3문장)",
  "targetAudience": "타겟 청중 설명",
  "tone": "톤과 분위기 (예: 캐주얼, 전문적, 유머러스 등)",
  "topics": [
    {
      "title": "추천 주제 제목",
      "reasoning": "이 주제가 바이럴될 수 있는 이유 (2-3문장)",
      "viralScore": 85
    }
  ]
}

**중요:**
- topics 배열에는 정확히 3개의 주제를 포함해주세요.
- viralScore는 1-100 사이의 숫자입니다.
- JSON 형식만 반환하고, 다른 텍스트는 포함하지 마세요.
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // JSON 파싱
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);
  return parsed;
}

export async function* generateNewScriptStream(
  topic: string,
  analysis: AnalysisResult
): AsyncGenerator<string, void, unknown> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
당신은 전문 YouTube 대본 작가입니다. 다음 정보를 바탕으로 새로운 YouTube 영상 대본을 작성해주세요.

**주제:** ${topic}

**작성 스타일 참고:**
- 스타일: ${analysis.styleSummary}
- 타겟 청중: ${analysis.targetAudience}
- 톤: ${analysis.tone}

**요구사항:**
1. 대본은 5-10분 분량의 YouTube 영상에 적합해야 합니다.
2. 인트로, 본문, 아웃트로 구조로 작성하세요.
3. 시청자의 관심을 끌고 유지할 수 있는 내용이어야 합니다.
4. 위에서 분석된 스타일과 톤을 최대한 반영하세요.
5. 자연스러운 한국어로 작성하세요.

**대본을 작성해주세요:**
`;

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}
