import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

const logSchema = z.object({
  level: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']),
  message: z.string(),
  context: z.record(z.any()).optional(),
  timestamp: z.date(),
  userId: z.string().uuid().optional(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
});

export const logsRouter = router({
  logError: protectedProcedure
    .input(logSchema)
    .mutation(async ({ ctx, input }) => {
      // Solo registrar errores en producción o si es explícitamente un error
      if (input.level === 'ERROR') {
        console.error('[Frontend Error]', input.message, input.context);
        
        // Aquí podrías guardar en la base de datos o enviar a un servicio de logging externo
        // Por ahora solo lo registramos en consola del servidor
      }
    }),
});
