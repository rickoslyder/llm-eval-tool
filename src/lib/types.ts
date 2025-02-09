export interface ModelEntity {
  id: string;
  name: string;
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
