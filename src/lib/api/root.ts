import { createCallerFactory, createTRPCRouter } from "./trpc";
import { modelsRouter } from "./routers/models";
import { evalsRouter } from "./routers/evals";
import { resultsRouter } from "./routers/results";
import { judgmentsRouter } from "./routers/judgments";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  models: modelsRouter,
  evals: evalsRouter,
  results: resultsRouter,
  judgments: judgmentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
