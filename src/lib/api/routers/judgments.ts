import { publicProcedure, protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const judgmentsRouter = createTRPCRouter({
  judgeEvals: protectedProcedure
    .input(
      z.object({
        evalIds: z.array(z.string()),
        judgeModelId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // In a real implementation, this would call the judge model's API
      // For now, we'll create dummy judgments
      const judgments = await Promise.all(
        input.evalIds.map(async (evalId) => {
          return prisma.judgment.create({
            data: {
              evalId,
              judgeModelId: input.judgeModelId,
              score: Math.random(), // Random score between 0 and 1
              justificationText: "Sample judgment explanation",
            },
          });
        })
      );
      return judgments;
    }),

  listJudgments: publicProcedure
    .input(
      z
        .object({
          evalId: z.string().optional(),
          judgeModelId: z.string().optional(),
          includeEval: z.boolean().optional(),
          includeJudgeModel: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return prisma.judgment.findMany({
        where: {
          evalId: input?.evalId,
          judgeModelId: input?.judgeModelId,
        },
        include: {
          eval: input?.includeEval ?? false,
          judgeModel: input?.includeJudgeModel ?? false,
        },
      });
    }),

  getJudgment: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.judgment.findUnique({
        where: { id: input.id },
        include: {
          eval: true,
          judgeModel: true,
        },
      });
    }),

  updateJudgment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        score: z.number().optional(),
        justificationText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.judgment.update({
        where: { id },
        data,
      });
    }),

  deleteJudgment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.judgment.delete({
        where: { id: input.id },
      });
    }),

  getLeaderboard: publicProcedure.query(async () => {
    type ModelWithRelations = Awaited<
      ReturnType<typeof prisma.model.findFirst>
    > & {
      results: (Awaited<ReturnType<typeof prisma.result.findFirst>> & {
        eval: Awaited<ReturnType<typeof prisma.eval.findFirst>> & {
          judgments: NonNullable<
            Awaited<ReturnType<typeof prisma.judgment.findFirst>>
          >[];
        };
      })[];
    };

    type ResultWithRelations = ModelWithRelations["results"][number];
    type JudgmentType = NonNullable<
      ResultWithRelations["eval"]["judgments"][number]
    >;

    const models = await prisma.model.findMany({
      include: {
        results: {
          include: {
            eval: {
              include: {
                judgments: true,
              },
            },
          },
        },
      },
    });

    return (models as ModelWithRelations[]).map((model) => {
      const totalJudgments = (model.results ?? []).reduce(
        (acc: number, result: ResultWithRelations) =>
          acc + (result.eval?.judgments ?? []).length,
        0
      );
      const totalScore = (model.results ?? []).reduce(
        (acc: number, result: ResultWithRelations) =>
          acc +
          (result.eval?.judgments ?? []).reduce(
            (sum: number, j: JudgmentType) => sum + j.score,
            0
          ),
        0
      );

      return {
        modelId: model.id,
        modelName: model.name,
        averageScore: totalJudgments > 0 ? totalScore / totalJudgments : 0,
        totalJudgments,
      };
    });
  }),
});
