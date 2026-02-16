import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ccnlRouter } from "./routers/ccnlRouter";
import { userRouter } from "./routers/userRouter";
import { statisticsRouter } from "./routers/statistics";
import { exportRouter } from "./routers/exportRouter";
import { legalRouter } from "./routers/legalRouter";
import { toolkitRouter } from "./routers/toolkitRouter";
import { servicesRouter } from "./routers/servicesRouter";
import { filesRouter } from "./routers/filesRouter";
import { aiRouter } from "./routers/aiRouter";
import { initializeDatabase } from "./init-database";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // CCNL management router
  ccnl: ccnlRouter,
  // User management router
  user: userRouter,
  // Statistics router
  statistics: statisticsRouter,
  // Export router
  export: exportRouter,

  // Normativa & Prassi
  legal: legalRouter,

  // Toolkit consulente (checklist/template)
  toolkit: toolkitRouter,

  // Servizi & richieste (Sindacati / Enti bilaterali)
  services: servicesRouter,

  // Upload/download
  files: filesRouter,

  // AI (opzionale)
  ai: aiRouter,

  // Database initialization (one-time setup)
  init: router({
    database: publicProcedure.mutation(async () => {
      const result = await initializeDatabase();
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;
