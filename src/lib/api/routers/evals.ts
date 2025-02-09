import { publicProcedure, protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateChatCompletion } from "@/lib/aiClient";

const EVAL_GENERATION_PROMPT = `You are an expert at creating evaluation questions for testing language models.
Given a master prompt, generate a high-quality evaluation question.
The question should:
1. Be clear and unambiguous
2. Test specific capabilities mentioned in the prompt
3. Have a well-defined expected answer format
4. Be challenging but solvable
5. Include example answers to demonstrate the expected quality

Format your response as a JSON object with:
{
  "questionText": "The actual question text",
  "tags": ["tag1", "tag2"],
  "difficulty": "easy|medium|hard",
  "expectedFormat": "Description of expected answer format",
  "exampleAnswer": "A high-quality example answer that meets all requirements",
  "validationCriteria": ["criterion1", "criterion2"],
  "skillsTested": ["skill1", "skill2"],
  "estimatedTimeMinutes": number
}`;

// Define the expected response type
const EvalResponseSchema = z.object({
  questionText: z.string(),
  tags: z.array(z.string()),
  difficulty: z.enum(["easy", "medium", "hard"]),
  expectedFormat: z.string(),
  exampleAnswer: z.string(),
  validationCriteria: z.array(z.string()),
  skillsTested: z.array(z.string()),
  estimatedTimeMinutes: z.number(),
});

export const evalsRouter = createTRPCRouter({
  generateEvals: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        modelIds: z.array(z.string()),
        options: z
          .object({
            temperature: z.number().min(0).max(2).default(0.7),
            maxTokens: z.number().min(100).max(4000).default(1000),
            numberOfQuestions: z.number().min(1).max(10).default(1),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get the selected models
      const models = await prisma.model.findMany({
        where: {
          id: {
            in: input.modelIds,
          },
        },
      });

      const options = {
        temperature: input.options?.temperature ?? 0.7,
        maxTokens: input.options?.maxTokens ?? 1000,
        numberOfQuestions: input.options?.numberOfQuestions ?? 1,
      };

      // Generate evals using each model
      const newEvals = await Promise.all(
        models.map(async (model) => {
          const modelEvals = [];

          for (let i = 0; i < options.numberOfQuestions; i++) {
            try {
              // Use the model to generate a question
              const response = await generateChatCompletion(
                [
                  { role: "system", content: EVAL_GENERATION_PROMPT },
                  {
                    role: "user",
                    content: `${input.prompt}\n\nThis is question ${i + 1} of ${
                      options.numberOfQuestions
                    }. Make it unique from other questions.`,
                  },
                ],
                model.name as any,
                {
                  temperature: options.temperature,
                  max_tokens: options.maxTokens,
                }
              );

              // Parse and validate the response
              const evalData = EvalResponseSchema.parse(JSON.parse(response));

              // Create the eval in the database
              const newEval = await prisma.eval.create({
                data: {
                  questionText: evalData.questionText,
                  creatorModelId: model.id,
                  tags: evalData.tags.join(","),
                  difficulty: evalData.difficulty,
                  metadata: {
                    expectedFormat: evalData.expectedFormat,
                    exampleAnswer: evalData.exampleAnswer,
                    validationCriteria: evalData.validationCriteria,
                    skillsTested: evalData.skillsTested,
                    estimatedTimeMinutes: evalData.estimatedTimeMinutes,
                    generationParams: {
                      temperature: options.temperature,
                      maxTokens: options.maxTokens,
                    },
                  },
                },
              });

              modelEvals.push(newEval);
            } catch (error) {
              console.error(
                `Error generating eval with model ${model.name}:`,
                error
              );
              // Create an eval entry with error information
              const errorEval = await prisma.eval.create({
                data: {
                  questionText: `Error generating question: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                  creatorModelId: model.id,
                  tags: "error",
                  difficulty: "unknown",
                  metadata: {
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                    generationParams: {
                      temperature: options.temperature,
                      maxTokens: options.maxTokens,
                    },
                  },
                },
              });
              modelEvals.push(errorEval);
            }
          }
          return modelEvals;
        })
      );

      // Flatten the array of arrays into a single array of evals
      return newEvals.flat();
    }),

  listEvals: publicProcedure
    .input(
      z
        .object({
          includeCreator: z.boolean().optional(),
          includeResults: z.boolean().optional(),
          includeJudgments: z.boolean().optional(),
          filters: z
            .object({
              difficulty: z.string().optional(),
              tags: z.array(z.string()).optional(),
              creatorModelIds: z.array(z.string()).optional(),
              skillsTested: z.array(z.string()).optional(),
              estimatedTimeRange: z
                .object({
                  min: z.number().optional(),
                  max: z.number().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const where = {
        AND: [
          input?.filters?.difficulty
            ? { difficulty: input.filters.difficulty }
            : {},
          input?.filters?.tags
            ? { tags: { contains: input.filters.tags.join(",") } }
            : {},
          input?.filters?.creatorModelIds
            ? { creatorModelId: { in: input.filters.creatorModelIds } }
            : {},
          input?.filters?.skillsTested
            ? {
                metadata: {
                  path: ["skillsTested"],
                  array_contains: input.filters.skillsTested,
                },
              }
            : {},
          input?.filters?.estimatedTimeRange?.min
            ? {
                metadata: {
                  path: ["estimatedTimeMinutes"],
                  gte: input.filters.estimatedTimeRange.min,
                },
              }
            : {},
          input?.filters?.estimatedTimeRange?.max
            ? {
                metadata: {
                  path: ["estimatedTimeMinutes"],
                  lte: input.filters.estimatedTimeRange.max,
                },
              }
            : {},
        ],
      };

      return prisma.eval.findMany({
        where,
        include: {
          creatorModel: input?.includeCreator ?? false,
          results: input?.includeResults ?? false,
          judgments: input?.includeJudgments ?? false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getEval: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.eval.findUnique({
        where: { id: input.id },
        include: {
          creatorModel: true,
          results: true,
          judgments: true,
        },
      });
    }),

  updateEval: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        questionText: z.string().optional(),
        tags: z.string().optional(),
        difficulty: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.eval.update({
        where: { id },
        data,
      });
    }),

  deleteEval: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.eval.delete({
        where: { id: input.id },
      });
    }),
});
