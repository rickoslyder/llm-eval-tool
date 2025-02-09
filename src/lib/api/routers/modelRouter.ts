import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";

export const modelRouter = createTRPCRouter({
  createModel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        baseUrl: z.string(),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const model = await prisma.model.create({
        data: {
          name: input.name,
          baseUrl: input.baseUrl,
          apiKey: input.apiKey,
        },
      });
      return model;
    }),

  listModels: publicProcedure.query(async () => {
    const models = await prisma.model.findMany();
    return models;
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
      const { id, ...rest } = input;
      const updatedModel = await prisma.model.update({
        where: { id },
        data: rest,
      });
      return updatedModel;
    }),

  deleteModel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.model.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
