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
당신은 전문 YouTube 스토리텔러입니다. 다음 정보를 바탕으로 60대 이상 중장년층이 좋아할 만한 감성적이고 따뜻한 YouTube 영상 대본을 작성해주세요.

**주제:** ${topic}

**작성 스타일 참고:**
- 스타일: ${analysis.styleSummary}
- 타겟 청중: 60대 이상 중장년 여성 (감성적이고 따뜻한 톤, 삶의 지혜와 공감 중시)
- 톤: 친근하고 부드러우며, 옆집 친구가 이야기해주듯 편안한 구어체

**60대 이상 타겟 맞춤 가이드:**
1. 감성과 공감: 인생 경험, 가족, 추억, 건강, 행복 등 공감할 수 있는 소재 활용
2. 따뜻한 어조: "~했대요", "~잖아요", "세상에..." 같은 친근한 표현 사용
3. 적당한 속도감: 너무 빠르지 않고, 여유있게 이야기 전개
4. 삶의 지혜: 교훈이나 긍정적 메시지로 마무리

**대본 작성 형식 - 매우 중요:**
1. 나레이션과 대화를 자연스럽게 섞어서 작성하세요
2. 대화 장면에서 "이름:" 같은 화자 표시를 절대 사용하지 마세요
3. 대신 나레이션으로 누가 말하는지 설명하세요
4. TTS(타입캐스트)에 바로 붙여넣을 수 있는 형식

**절대 금지 사항:**
- 화자 이름 표시 (철수:, 영희:, 나레이터:, MC: 등) ← 절대 금지!
- 콜론(:) 사용 금지
- 마크다운 (**, *, _, #, ##, - 등)
- 괄호 속 지문 ([웃으며], (박수), <효과음>, (음악) 등)
- 섹션 제목이나 구분선

**올바른 작성 예시:**
❌ 잘못된 예:
"철수: 안녕하세요, 영희씨!"
"영희: 오랜만이에요, 철수씨."

✅ 올바른 예:
"어느 화창한 봄날 아침이었어요. 철수가 길을 걷다가 영희를 만났죠.
'안녕하세요, 영희씨!'
영희도 반갑게 인사를 건넸어요.
'오랜만이에요, 철수씨.'
두 사람은 오랜만에 만난 반가움에 활짝 웃었답니다."

**추가 지침:**
- 참고 대본에 등장하는 인물 이름이 있다면, 새로운 한국식 이름으로 자연스럽게 변경
- 5-10분 분량 (약 1500-2500자)
- 대본은 인트로부터 아웃트로까지 자연스럽게 이어져야 합니다

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

// 대본 텍스트 정리 함수 (더 강력한 후처리)
function cleanScriptText(text: string): string {
  // 1. 화자 표시 제거 (이름: 형태) - 더 강력하게
  text = text.replace(/^[가-힣a-zA-Z0-9\s]+\s*:\s*/gm, '');
  text = text.replace(/\n[가-힣a-zA-Z0-9\s]+\s*:\s*/g, '\n');
  
  // 2. 마크다운 볼드/이탤릭 제거
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  
  // 3. 마크다운 헤더 제거
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // 4. 대괄호 지문 제거 (모든 대괄호 내용)
  text = text.replace(/\[([^\]]+)\]/g, '');
  
  // 5. 괄호 지문 제거 (웃음, 손짓, 효과음 등)
  text = text.replace(/\(([^)]*(?:웃|손|박수|효과음|음악|배경|화면|숨|한숨|탄식)[^)]*)\)/gi, '');
  
  // 6. 마크다운 리스트 기호 제거
  text = text.replace(/^[\-\*]\s+/gm, '');
  
  // 7. 콜론(:) 단독으로 남아있는 경우 제거
  text = text.replace(/:\s+/g, ' ');
  
  // 8. 과도한 줄바꿈 정리 (3줄 이상 → 2줄로)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text;
}
