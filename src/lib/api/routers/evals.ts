import { publicProcedure, protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const evalsRouter = createTRPCRouter({
  generateEvals: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        modelIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const newEvals = await Promise.all(
        input.modelIds.map(async (modelId) => {
          return prisma.eval.create({
            data: {
              questionText: `Generated from prompt: ${input.prompt}`,
              creatorModelId: modelId,
            },
          });
        })
      );
      return newEvals;
    }),

  listEvals: publicProcedure
    .input(
      z
        .object({
          includeCreator: z.boolean().optional(),
          includeResults: z.boolean().optional(),
          includeJudgments: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return prisma.eval.findMany({
        include: {
          creatorModel: input?.includeCreator ?? false,
          results: input?.includeResults ?? false,
          judgments: input?.includeJudgments ?? false,
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
