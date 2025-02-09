import { publicProcedure, protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { ResultEntity } from "@/lib/types";

export const resultsRouter = createTRPCRouter({
  runEval: protectedProcedure
    .input(
      z.object({
        evalId: z.string(),
        modelId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // In a real implementation, this would call the model's API
      // For now, we'll just create a dummy result
      return prisma.result.create({
        data: {
          evalId: input.evalId,
          modelId: input.modelId,
          responseText: "Sample response from model",
        },
      });
    }),

  listResults: publicProcedure
    .input(
      z
        .object({
          evalId: z.string().optional(),
          modelId: z.string().optional(),
          includeEval: z.boolean().optional(),
          includeModel: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return prisma.result.findMany({
        where: {
          evalId: input?.evalId,
          modelId: input?.modelId,
        },
        include: {
          eval: input?.includeEval ?? false,
          model: input?.includeModel ?? false,
        },
      });
    }),

  getResult: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.result.findUnique({
        where: { id: input.id },
        include: {
          eval: true,
          model: true,
        },
      });
    }),

  updateResult: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        responseText: z.string().optional(),
        errorLog: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.result.update({
        where: { id },
        data,
      });
    }),

  deleteResult: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.result.delete({
        where: { id: input.id },
      });
    }),

  getModelStats: publicProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      const results = await prisma.result.findMany({
        where: { modelId: input.modelId },
        include: {
          eval: true,
        },
      });

      type PrismaResult = NonNullable<
        Awaited<ReturnType<typeof prisma.result.findFirst>>
      >;

      return {
        totalRuns: results.length,
        successfulRuns: results.filter((r: PrismaResult) => !r.errorLog).length,
        failedRuns: results.filter((r: PrismaResult) => r.errorLog).length,
      };
    }),
});
