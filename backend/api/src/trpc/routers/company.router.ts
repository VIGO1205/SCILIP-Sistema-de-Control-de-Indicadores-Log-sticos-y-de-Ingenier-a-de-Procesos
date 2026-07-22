import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const companyRouter = router({
  getMyCompany: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { roleId: true },
    });

    const company = await ctx.prisma.company.findFirst({
      include: {
        branches: { orderBy: { isMain: 'desc' } },
      },
    });
    return company;
  }),

  updateCompany: protectedProcedure
    .input(z.object({
      id: z.string().optional(),
      legalName: z.string().min(2).max(255).optional(),
      tradeName: z.string().max(255).optional(),
      taxId: z.string().max(50).optional(),
      email: z.string().email().optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      address: z.string().optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      country: z.string().max(100).optional().nullable(),
      website: z.string().max(255).optional().nullable(),
      logoUrl: z.string().max(500).optional().nullable(),
      currency: z.string().max(10).optional(),
      timezone: z.string().max(50).optional(),
      fiscalYearStart: z.number().min(1).max(12).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (id) {
        return ctx.prisma.company.update({ where: { id }, data });
      }

      const existing = await ctx.prisma.company.findFirst();
      if (existing) {
        return ctx.prisma.company.update({ where: { id: existing.id }, data });
      }

      return ctx.prisma.company.create({
        data: {
          taxId: data.taxId || '000000000',
          legalName: data.legalName || 'Empresa',
          tradeName: data.tradeName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          website: data.website,
          logoUrl: data.logoUrl,
          currency: data.currency,
          timezone: data.timezone,
          fiscalYearStart: data.fiscalYearStart,
        },
      });
    }),

  listBranches: protectedProcedure.query(async ({ ctx }) => {
    const company = await ctx.prisma.company.findFirst();
    if (!company) return [];
    return ctx.prisma.branch.findMany({
      where: { companyId: company.id },
      orderBy: { isMain: 'desc' },
    });
  }),

  createBranch: protectedProcedure
    .input(z.object({
      code: z.string().min(1).max(50),
      name: z.string().min(1).max(255),
      address: z.string().optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      email: z.string().email().optional().nullable(),
      isMain: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.findFirst();
      if (!company) throw new Error('No hay empresa configurada');

      if (input.isMain) {
        await ctx.prisma.branch.updateMany({
          where: { companyId: company.id, isMain: true },
          data: { isMain: false },
        });
      }

      return ctx.prisma.branch.create({
        data: {
          code: input.code,
          name: input.name,
          address: input.address || null,
          city: input.city || null,
          phone: input.phone || null,
          email: input.email || null,
          isMain: input.isMain || false,
          companyId: company.id,
        },
      });
    }),

  updateBranch: protectedProcedure
    .input(z.object({
      id: z.string(),
      code: z.string().min(1).max(50).optional(),
      name: z.string().min(1).max(255).optional(),
      address: z.string().optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      email: z.string().email().optional().nullable(),
      isMain: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (data.isMain) {
        const branch = await ctx.prisma.branch.findUnique({ where: { id } });
        if (branch) {
          await ctx.prisma.branch.updateMany({
            where: { companyId: branch.companyId, isMain: true },
            data: { isMain: false },
          });
        }
      }

      return ctx.prisma.branch.update({
        where: { id },
        data: {
          ...(data.code !== undefined && { code: data.code }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.address !== undefined && { address: data.address || null }),
          ...(data.city !== undefined && { city: data.city || null }),
          ...(data.phone !== undefined && { phone: data.phone || null }),
          ...(data.email !== undefined && { email: data.email || null }),
          ...(data.isMain !== undefined && { isMain: data.isMain }),
        },
      });
    }),

  deleteBranch: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const branch = await ctx.prisma.branch.findUnique({ where: { id: input.id } });
      if (branch?.isMain) throw new Error('No se puede eliminar la sucursal principal');
      await ctx.prisma.branch.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
