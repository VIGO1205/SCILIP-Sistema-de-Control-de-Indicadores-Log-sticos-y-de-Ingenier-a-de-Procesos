import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const companyRouter = router({
  getMyCompany: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.companyId) return null;
    const company = await ctx.prisma.company.findUnique({
      where: { id: ctx.user.companyId },
      include: {
        branches: { orderBy: { isMain: 'desc' } },
      },
    });
    return company;
  }),

  createCompany: protectedProcedure
    .input(z.object({
      legalName: z.string().min(2).max(255),
      tradeName: z.string().max(255).optional(),
      taxId: z.string().min(1).max(50),
      country: z.string().max(100).optional(),
      city: z.string().max(100).optional(),
      address: z.string().optional(),
      phone: z.string().max(50).optional(),
      email: z.string().email().optional(),
      currency: z.string().max(10).optional(),
      timezone: z.string().max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.companyId) {
        throw new Error('Ya perteneces a una empresa');
      }

      const company = await ctx.prisma.company.create({
        data: {
          taxId: input.taxId,
          legalName: input.legalName,
          tradeName: input.tradeName || null,
          country: input.country || null,
          city: input.city || null,
          address: input.address || null,
          phone: input.phone || null,
          email: input.email || null,
          currency: input.currency || 'COP',
          timezone: input.timezone || 'America/Bogota',
        },
      });

      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { companyId: company.id },
      });

      const adminRole = await ctx.prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
          name: 'ADMIN',
          description: 'Administrador de empresa',
          permissions: { modules: ['all'], kpis: ['all'], reports: ['all'], settings: true },
        },
      });

      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { roleId: adminRole.id },
      });

      return company;
    }),

  updateCompany: protectedProcedure
    .input(z.object({
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
      if (!ctx.user.companyId) throw new Error('No perteneces a ninguna empresa');
      return ctx.prisma.company.update({
        where: { id: ctx.user.companyId },
        data: input,
      });
    }),

  listBranches: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.companyId) return [];
    return ctx.prisma.branch.findMany({
      where: { companyId: ctx.user.companyId },
      orderBy: { isMain: 'desc' },
    });
  }),

  createBranch: protectedProcedure
    .input(z.object({
      code: z.string().min(1).max(50),
      name: z.string().min(1).max(255),
      address: z.string().optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      country: z.string().max(100).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      email: z.string().email().optional().nullable(),
      isMain: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.companyId) throw new Error('No perteneces a ninguna empresa');

      if (input.isMain) {
        await ctx.prisma.branch.updateMany({
          where: { companyId: ctx.user.companyId, isMain: true },
          data: { isMain: false },
        });
      }

      return ctx.prisma.branch.create({
        data: {
          code: input.code,
          name: input.name,
          address: input.address || null,
          city: input.city || null,
          country: input.country || null,
          phone: input.phone || null,
          email: input.email || null,
          isMain: input.isMain || false,
          companyId: ctx.user.companyId,
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
      country: z.string().max(100).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      email: z.string().email().optional().nullable(),
      isMain: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.companyId) throw new Error('No perteneces a ninguna empresa');
      const { id, ...data } = input;

      if (data.isMain) {
        await ctx.prisma.branch.updateMany({
          where: { companyId: ctx.user.companyId, isMain: true },
          data: { isMain: false },
        });
      }

      return ctx.prisma.branch.update({
        where: { id, companyId: ctx.user.companyId },
        data: {
          ...(data.code !== undefined && { code: data.code }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.address !== undefined && { address: data.address || null }),
          ...(data.city !== undefined && { city: data.city || null }),
          ...(data.country !== undefined && { country: data.country || null }),
          ...(data.phone !== undefined && { phone: data.phone || null }),
          ...(data.email !== undefined && { email: data.email || null }),
          ...(data.isMain !== undefined && { isMain: data.isMain }),
        },
      });
    }),

  deleteBranch: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.companyId) throw new Error('No perteneces a ninguna empresa');
      const branch = await ctx.prisma.branch.findFirst({
        where: { id: input.id, companyId: ctx.user.companyId },
      });
      if (!branch) throw new Error('Sucursal no encontrada');
      if (branch.isMain) throw new Error('No se puede eliminar la sucursal principal');
      await ctx.prisma.branch.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
