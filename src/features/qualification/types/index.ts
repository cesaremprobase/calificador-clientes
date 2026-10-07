export interface QuestionOption {
  id: string;
  label: string;
  points: number;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: QuestionOption[];
}

export interface QualificationConfig {
  id: string;
  name: string;
  welcomeMessage: string;
  approvalScore: number;
  whatsappNumber: string;
  questions: SurveyQuestion[];
  qualifiedMessageTemplate: string;
  disqualifiedMessage: string;
}

export interface UserSessionState {
  chatId: number;
  currentQuestionIndex: number;
  answers: Record<string, QuestionOption>;
  score: number;
  updatedAt: number;
}

export interface EvaluationResult {
  score: number;
  isQualified: boolean;
  summaryText: string;
  whatsappUrl?: string;
}
