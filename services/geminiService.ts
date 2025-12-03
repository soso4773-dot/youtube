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
당신은 전문 YouTube 나레이터입니다. 다음 정보를 바탕으로 YouTube 영상에서 직접 말할 대본을 작성해주세요.

**주제:** ${topic}

**작성 스타일 참고:**
- 스타일: ${analysis.styleSummary}
- 타겟 청중: ${analysis.targetAudience}
- 톤: ${analysis.tone}

**절대적인 규칙 - 반드시 지켜주세요:**
1. 오직 말할 내용만 작성하세요
2. 다음 요소들을 절대 사용하지 마세요:
   - 화자 이름 (주하:, 나레이터:, MC: 등)
   - 콜론(:)
   - 마크다운 (**, *, _, #, ##, - 등)
   - 괄호 속 지문 ([웃으며], (박수), <효과음> 등)
   - 섹션 제목이나 구분선
3. 한 사람이 카메라 보고 자연스럽게 말하는 형식으로만 작성
4. 5-10분 분량 (약 1500-2500자)
5. 대본은 인트로부터 아웃트로까지 매끄럽게 이어져야 합니다

예시:
잘못된 예: "주하: 안녕하세요! **오늘은** [손 흔들며] 소개할게요"
올바른 예: "안녕하세요! 오늘은 소개할게요"

지금 바로 대본을 작성해주세요. 다른 설명 없이 대본만 작성하세요:
`;

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    let chunkText = chunk.text();
    
    // 후처리: 불필요한 서식 제거
    chunkText = cleanScriptText(chunkText);
    
    yield chunkText;
  }
}

// 대본 텍스트 정리 함수
function cleanScriptText(text: string): string {
  // 화자 표시 제거 (이름: 형태)
  text = text.replace(/^[가-힣a-zA-Z]+\s*:\s*/gm, '');
  
  // 마크다운 볼드/이탤릭 제거
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  
  // 마크다운 헤더 제거
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // 대괄호 지문 제거
  text = text.replace(/\[([^\]]+)\]/g, '');
  
  // 괄호 지문 제거 (단, 설명용 괄호는 유지)
  text = text.replace(/\(([^)]*(?:웃|손|박수|효과음|음악|배경|화면)[^)]*)\)/gi, '');
  
  // 마크다운 리스트 기호 제거
  text = text.replace(/^[\-\*]\s+/gm, '');
  
  return text;
}
