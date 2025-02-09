import { publicProcedure, protectedProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const modelsRouter = createTRPCRouter({
  createModel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        baseUrl: z.string(),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.model.create({ data: input });
    }),

  listModels: publicProcedure.query(async () => {
    return prisma.model.findMany();
  }),

  getModel: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.model.findUnique({
        where: { id: input.id },
        include: {
          evals: true,
          results: true,
          judgments: true,
        },
      });
    }),

  updateModel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        baseUrl: z.string().optional(),
        apiKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.model.update({
        where: { id },
        data,
      });
    }),

  deleteModel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.model.delete({
        where: { id: input.id },
      });
    }),
});
