import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as ccnlDb from "../ccnlDb";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can perform this action",
    });
  }
  return next({ ctx });
});

// Validation schemas
const ccnlSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  sector: z.string().min(1),
  sectorCategory: z.string().min(1),
  issuer: z.string().min(1),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  description: z.string().optional(),
  isENGEB: z.number().int().min(0).max(1),
});

const ccnlLevelSchema = z.object({
  ccnlId: z.number().int().positive(),
  level: z.string().min(1),
  description: z.string().min(1),
  baseSalaryMonthly: z.string().min(1),
});

const ccnlAdditionalCostsSchema = z.object({
  ccnlId: z.number().int().positive(),
  tfr: z.string().min(1),
  socialContributions: z.string().min(1),
  otherBenefits: z.string().min(1),
});

const ccnlContributionSchema = z.object({
  ccnlId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  percentage: z.string().min(1),
  amount: z.string().min(1),
  isPercentage: z.number().int().min(0).max(1),
  category: z.enum(["bilateral", "pension", "health", "other"]),
});

export const ccnlRouter = router({
  // Public procedures - read-only access
  getAll: publicProcedure.query(async () => {
    return await ccnlDb.getAllCCNLs();
  }),

  getAllPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(50),
        searchTerm: z.string().optional().default(""),
        sector: z.string().optional().default(""),
        issuer: z.string().optional().default(""),
        macroSector: z.string().optional().default(""),
      })
    )
    .query(async ({ input }) => {
      return await ccnlDb.getAllCCNLsPaginated(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const ccnl = await ccnlDb.getCCNLById(input.id);
      if (!ccnl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CCNL not found",
        });
      }
      return ccnl;
    }),

  getComplete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const ccnl = await ccnlDb.getCompleteCCNL(input.id);
      if (!ccnl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CCNL not found",
        });
      }
      return ccnl;
    }),

  // Admin procedures - full CRUD access
  create: adminProcedure
    .input(ccnlSchema)
    .mutation(async ({ input }) => {
      const id = await ccnlDb.createCCNL(input);
      return { id, success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: ccnlSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      await ccnlDb.updateCCNL(input.id, input.data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await ccnlDb.deleteCCNL(input.id);
      return { success: true };
    }),

  // CCNL Levels management
  levels: router({
    getByCCNLId: publicProcedure
      .input(z.object({ ccnlId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return await ccnlDb.getLevelsByCCNLId(input.ccnlId);
      }),

    create: adminProcedure
      .input(ccnlLevelSchema)
      .mutation(async ({ input }) => {
        const id = await ccnlDb.createCCNLLevel(input);
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          data: ccnlLevelSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        await ccnlDb.updateCCNLLevel(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await ccnlDb.deleteCCNLLevel(input.id);
        return { success: true };
      }),
  }),

  // CCNL Additional Costs management
  additionalCosts: router({
    getByCCNLId: publicProcedure
      .input(z.object({ ccnlId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return await ccnlDb.getAdditionalCostsByCCNLId(input.ccnlId);
      }),

    upsert: adminProcedure
      .input(ccnlAdditionalCostsSchema)
      .mutation(async ({ input }) => {
        await ccnlDb.upsertAdditionalCosts(input);
        return { success: true };
      }),
  }),

  // Custom CCNL - complete creation in one transaction
  createCustom: protectedProcedure
    .input(
      z.object({
        ccnl: z.object({
          externalId: z.string().min(1),
          name: z.string().min(1),
          sector: z.string().min(1),
          sectorCategory: z.string().min(1),
          issuer: z.string().min(1),
          validFrom: z.string().min(1),
          validTo: z.string().min(1),
          description: z.string().optional(),
        }),
        levels: z.array(
          z.object({
            level: z.string().min(1),
            description: z.string().min(1),
            baseSalaryMonthly: z.string().min(1),
          })
        ).min(1),
        additionalCosts: z.object({
          tfr: z.string().min(1),
          socialContributions: z.string().min(1),
          otherBenefits: z.string().min(1),
        }),
        contributions: z.array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            percentage: z.string().min(1),
            amount: z.string().min(1),
            isPercentage: z.number().int().min(0).max(1),
            category: z.enum(["bilateral", "pension", "health", "other"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create CCNL with isCustom flag and createdBy
      const ccnlId = await ccnlDb.createCCNL({
        ...input.ccnl,
        isENGEB: 0,
        isCustom: 1,
        createdBy: ctx.user.id,
      });

      // Create levels
      for (const level of input.levels) {
        await ccnlDb.createCCNLLevel({
          ccnlId,
          ...level,
        });
      }

      // Create additional costs
      await ccnlDb.upsertAdditionalCosts({
        ccnlId,
        ...input.additionalCosts,
      });

      // Create contributions
      for (const contribution of input.contributions) {
        await ccnlDb.createCCNLContribution({
          ccnlId,
          ...contribution,
        });
      }

      return { id: ccnlId, success: true };
    }),

  // Get custom CCNLs created by current user
  getMyCustom: protectedProcedure.query(async ({ ctx }) => {
    return await ccnlDb.getCustomCCNLsByUserId(ctx.user.id);
  }),

  // Update custom CCNL (only owner can update)
  updateCustom: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        ccnl: z.object({
          name: z.string().min(1),
          sector: z.string().min(1),
          sectorCategory: z.string().min(1),
          issuer: z.string().min(1),
          validFrom: z.string().min(1),
          validTo: z.string().min(1),
          description: z.string().optional(),
        }),
        levels: z.array(
          z.object({
            id: z.number().int().positive().optional(), // existing level ID
            level: z.string().min(1),
            description: z.string().min(1),
            baseSalaryMonthly: z.string().min(1),
          })
        ).min(1),
        additionalCosts: z.object({
          tfr: z.string().min(1),
          socialContributions: z.string().min(1),
          otherBenefits: z.string().min(1),
        }),
        contributions: z.array(
          z.object({
            id: z.number().int().positive().optional(), // existing contribution ID
            name: z.string().min(1),
            description: z.string().optional(),
            percentage: z.string().min(1),
            amount: z.string().min(1),
            isPercentage: z.number().int().min(0).max(1),
            category: z.enum(["bilateral", "pension", "health", "other"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingCCNL = await ccnlDb.getCCNLById(input.id);
      if (!existingCCNL) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CCNL not found",
        });
      }
      if (existingCCNL.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own custom CCNLs",
        });
      }

      // Update CCNL basic info
      await ccnlDb.updateCCNL(input.id, input.ccnl);

      // Delete existing levels and create new ones
      const existingLevels = await ccnlDb.getLevelsByCCNLId(input.id);
      for (const level of existingLevels) {
        await ccnlDb.deleteCCNLLevel(level.id);
      }
      for (const level of input.levels) {
        await ccnlDb.createCCNLLevel({
          ccnlId: input.id,
          level: level.level,
          description: level.description,
          baseSalaryMonthly: level.baseSalaryMonthly,
        });
      }

      // Update additional costs
      await ccnlDb.upsertAdditionalCosts({
        ccnlId: input.id,
        ...input.additionalCosts,
      });

      // Delete existing contributions and create new ones
      const existingContributions = await ccnlDb.getContributionsByCCNLId(input.id);
      for (const contribution of existingContributions) {
        await ccnlDb.deleteCCNLContribution(contribution.id);
      }
      for (const contribution of input.contributions) {
        await ccnlDb.createCCNLContribution({
          ccnlId: input.id,
          name: contribution.name,
          description: contribution.description,
          percentage: contribution.percentage,
          amount: contribution.amount,
          isPercentage: contribution.isPercentage,
          category: contribution.category,
        });
      }

      return { success: true };
    }),

  // Delete custom CCNL (only owner can delete)
  deleteCustom: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingCCNL = await ccnlDb.getCCNLById(input.id);
      if (!existingCCNL) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CCNL not found",
        });
      }
      if (existingCCNL.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own custom CCNLs",
        });
      }

      // Delete CCNL (cascade will delete related records)
      await ccnlDb.deleteCCNL(input.id);
      return { success: true };
    }),

  // CCNL Contributions management
  contributions: router({
    getByCCNLId: publicProcedure
      .input(z.object({ ccnlId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return await ccnlDb.getContributionsByCCNLId(input.ccnlId);
      }),

    create: adminProcedure
      .input(ccnlContributionSchema)
      .mutation(async ({ input }) => {
        const id = await ccnlDb.createCCNLContribution(input);
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          data: ccnlContributionSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        await ccnlDb.updateCCNLContribution(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await ccnlDb.deleteCCNLContribution(input.id);
        return { success: true };
      }),
  }),

  // Simulator-specific procedures
  getENGEBCCNLs: publicProcedure
    .input(z.object({ sectorCategory: z.string().optional() }))
    .query(async ({ input }) => {
      return await ccnlDb.getENGEBCCNLs(input.sectorCategory);
    }),

  getNationalCCNLs: publicProcedure.query(async () => {
    return await ccnlDb.getNationalCCNLs();
  }),

  getByExternalId: publicProcedure
    .input(z.object({ externalId: z.string().min(1) }))
    .query(async ({ input }) => {
      return await ccnlDb.getCompleteCCNLByExternalId(input.externalId);
    }),

  // Search CCNLs by text query
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().positive().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      return await ccnlDb.searchCCNLs(input.query, input.limit);
    }),
});
