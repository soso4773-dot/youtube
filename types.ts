export interface SuggestedTopic {
  title: string;
  reasoning: string;
  viralScore: number;
}

export interface AnalysisResult {
  styleSummary: string;
  targetAudience: string;
  tone: string;
  topics: SuggestedTopic[];
}

export enum AppStep {
  INPUT = 'INPUT',
  ANALYSIS = 'ANALYSIS',
  GENERATION = 'GENERATION',
}

export interface ScriptGenerationState {
  topic: string;
  content: string;
  isStreaming: boolean;
}