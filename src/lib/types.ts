export interface ModelEntity {
  id: string;
  name: string;
  modelId: string;
  baseUrl: string;
  apiKey: string;
  createdAt: Date;
  evals?: EvalEntity[];
  results?: ResultEntity[];
  judgments?: JudgmentEntity[];
}

export interface EvalEntity {
  id: string;
  questionText: string;
  creatorModelId: string;
  tags: string | null;
  difficulty: string | null;
  metadata: EvalMetadata | null;
  createdAt: Date;
  creatorModel?: ModelEntity;
  results?: ResultEntity[];
  judgments?: JudgmentEntity[];
}

export interface ResultEntity {
  id: string;
  evalId: string;
  modelId: string;
  responseText: string | null;
  errorLog: string | null;
  createdAt: Date;
  eval?: EvalEntity;
  model?: ModelEntity;
}

export interface JudgmentEntity {
  id: string;
  evalId: string;
  judgeModelId: string;
  score: number;
  justificationText: string;
  createdAt: Date;
  eval?: EvalEntity;
  judgeModel?: ModelEntity;
}

export interface EvalMetadata {
  expectedFormat: string;
  exampleAnswer: string;
  validationCriteria: string[];
  skillsTested: string[];
  estimatedTimeMinutes: number;
  generationParams?: {
    temperature: number;
    maxTokens: number;
  };
  error?: string;
}

export interface Eval {
  id: string;
  questionText: string;
  creatorModelId: string;
  tags: string | null;
  difficulty: string;
  metadata: EvalMetadata | null;
  createdAt: Date;
  results: Result[];
  judgments: Judgment[];
  creatorModel: Model;
}

export interface Result {
  id: string;
  evalId: string;
  modelId: string;
  responseText: string | null;
  errorLog: string | null;
  createdAt: Date;
}

export interface Judgment {
  id: string;
  evalId: string;
  judgeModelId: string;
  score: number;
  justificationText: string;
  createdAt: Date;
}

export interface Model {
  id: string;
  name: string;
  modelId: string;
  baseUrl: string;
  apiKey: string;
  createdAt: Date;
}
