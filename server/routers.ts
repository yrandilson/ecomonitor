import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { FireRiskPredictor, generateMockHistoricalData, type FirePredictionInput } from "./ml-predictor";
import { createOccurrence, getRecentOccurrences, getOccurrenceById, getOccurrencesByType, createValidation, getValidationsByOccurrence, updateUserRanking, getTopRankings, getMonthlyTopRankings, getUserBadges, createSimulation, getUserSimulations, getOccurrenceStats, updateOccurrenceRiskScore, getCriticalOccurrences, getOccurrencesByStatus, markAlertAsRead, createAlert } from "./db";
import { calculateOccurrenceRisk } from "./physics";
import { getCurrentWeather, getWeatherForecast, calculateFireWeatherIndex } from "./integrations/openweather";
import { validateFireOccurrence, getFireStatistics, getFireDetections } from "./integrations/nasa-firms";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      return ctx.user || null;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Occurrences router
  occurrences: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["fire", "water_pollution", "air_pollution", "drought", "deforestation", "flooding", "other"]),
        latitude: z.number(),
        longitude: z.number(),
        description: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        physicalParameters: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createOccurrence({
          userId: ctx.user.id,
          type: input.type as any,
          latitude: input.latitude as any,
          longitude: input.longitude as any,
          description: input.description,
          severity: input.severity as any,
          physicalParameters: input.physicalParameters ? (input.physicalParameters as any) : null,
        });
        
        // Calculate risk score using physics engine
        if (input.physicalParameters) {
          const riskScore = calculateOccurrenceRisk(input.type, input.physicalParameters);
          const occurrenceId = (result as any).insertId || 1;
          await updateOccurrenceRiskScore(occurrenceId, riskScore);
        }
        
        // Award points for creating occurrence
        await updateUserRanking(ctx.user.id, 10);
        
        // Se for incêndio, tentar validar com satélite em background
        if (input.type === 'fire') {
          // Executar validação em background (não bloquear resposta)
          setTimeout(async () => {
            try {
              const occurrenceId = (result as any).insertId || 1;
              const validation = await validateFireOccurrence(
                input.latitude,
                input.longitude,
                new Date(),
                5,
                24
              );
              
              if (validation.isValidated) {
                console.log(`[Auto-validation] Occurrence #${occurrenceId} validated by satellite!`);
                // Atualizar no banco será feito pelo worker posteriormente
              }
            } catch (error) {
              console.error('[Auto-validation] Error:', error);
            }
          }, 0);
        }
        
        return result;
      }),
    
    getRecent: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getRecentOccurrences(input.limit || 20);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getOccurrenceById(input.id);
      }),
    
    getByType: publicProcedure
      .input(z.object({ type: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getOccurrencesByType(input.type, input.limit || 50);
      }),
    
    getCritical: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getCriticalOccurrences(input.limit || 20);
      }),
    
    getByStatus: publicProcedure
      .input(z.object({ status: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getOccurrencesByStatus(input.status, input.limit || 50);
      }),
    
    getStats: publicProcedure
      .query(async () => {
        return await getOccurrenceStats();
      }),
  }),
  
  // Validations router
  validations: router({
    create: protectedProcedure
      .input(z.object({
        occurrenceId: z.number(),
        isValid: z.boolean(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createValidation({
          occurrenceId: input.occurrenceId,
          userId: ctx.user.id,
          isValid: input.isValid,
          comment: input.comment,
        });
        
        // Award points for validation
        await updateUserRanking(ctx.user.id, 5);
        
        // Create alert for occurrence owner
        await createAlert({
          userId: ctx.user.id,
          occurrenceId: input.occurrenceId,
          type: "validation",
          severity: "medium",
          message: input.isValid ? "Sua ocorrência foi validada!" : "Sua ocorrência foi rejeitada",
        });
      }),
    
    getByOccurrence: publicProcedure
      .input(z.object({ occurrenceId: z.number() }))
      .query(async ({ input }) => {
        return await getValidationsByOccurrence(input.occurrenceId);
      }),
  }),
  
  // Simulations router
  simulations: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["fire", "water", "pollution"]),
        parameters: z.record(z.string(), z.any()),
        results: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ ctx, input }) => {
        await createSimulation({
          userId: ctx.user.id,
          type: input.type as any,
          parameters: JSON.stringify(input.parameters),
          results: JSON.stringify(input.results),
        });
        
        // Award points for simulation
        await updateUserRanking(ctx.user.id, 3);
      }),
    
    getUserSimulations: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserSimulations(ctx.user.id, input.limit || 20);
      }),
  }),
  
  // Alerts router
  alerts: router({
    getUserAlerts: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        // Note: This uses the existing getUserAlerts from db.ts
        // In a real implementation, we'd need to add this to db.ts
        return [];
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        return await markAlertAsRead(input.alertId);
      }),
  }),
  
  // Gamification router
  gamification: router({
    getTopRankings: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getTopRankings(input.limit || 10);
      }),
    
    getMonthlyRankings: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getMonthlyTopRankings(input.limit || 10);
      }),
    
    getUserBadges: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getUserBadges(input.userId);
      }),
  }),

  predictions: router({
    predictFireRisk: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
        daysAhead: z.number().min(1).max(7).default(7),
      }))
      .query(async ({ input }) => {
        try {
          // Gerar dados históricos simulados
          const historicalData = generateMockHistoricalData(30);

          // Criar e treinar preditor
          const predictor = new FireRiskPredictor();
          predictor.train(historicalData);

          // Fazer previsões
          const predictionInput: FirePredictionInput = {
            latitude: input.latitude,
            longitude: input.longitude,
            historicalTemperature: historicalData.temperature,
            historicalHumidity: historicalData.humidity,
            historicalWindSpeed: historicalData.windSpeed,
            historicalPrecipitation: historicalData.precipitation,
            vegetationDensity: 75,
            elevation: 750,
            daysAhead: input.daysAhead,
          };

          const predictions = predictor.predictNext7Days(predictionInput);
          return { success: true, predictions };
        } catch (error) {
          console.error('[ML] Erro ao prever risco:', error);
          return { success: false, predictions: [], error: 'Erro ao gerar previsões' };
        }
      }),
  }),

  // Weather data router (OpenWeatherMap integration)
  weather: router({
    getCurrent: publicProcedure
      .input(z.object({ 
        latitude: z.number(), 
        longitude: z.number() 
      }))
      .query(async ({ input }) => {
        return await getCurrentWeather(input.latitude, input.longitude);
      }),
    
    getForecast: publicProcedure
      .input(z.object({ 
        latitude: z.number(), 
        longitude: z.number(),
        days: z.number().min(1).max(7).default(7)
      }))
      .query(async ({ input }) => {
        return await getWeatherForecast(input.latitude, input.longitude, input.days);
      }),
    
    getFireIndex: publicProcedure
      .input(z.object({ 
        latitude: z.number(), 
        longitude: z.number() 
      }))
      .query(async ({ input }) => {
        return await calculateFireWeatherIndex(input.latitude, input.longitude);
      }),
  }),

  // Satellite validation router (NASA FIRMS integration)
  satellite: router({
    validateOccurrence: protectedProcedure
      .input(z.object({ 
        occurrenceId: z.number() 
      }))
      .mutation(async ({ input }) => {
        const occurrence = await getOccurrenceById(input.occurrenceId);
        if (!occurrence) {
          throw new Error('Occurrence not found');
        }
        
        const result = await validateFireOccurrence(
          Number(occurrence.latitude),
          Number(occurrence.longitude),
          new Date(occurrence.createdAt),
          5, // 5km radius
          48 // 48 hours window
        );
        
        if (result.isValidated) {
          await updateOccurrenceRiskScore(input.occurrenceId, result.confidence);
        }
        
        return result;
      }),
    
    getFireDetections: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().default(10),
        days: z.number().default(1),
      }))
      .query(async ({ input }) => {
        return await getFireDetections(
          input.latitude,
          input.longitude,
          input.radius,
          input.days
        );
      }),
    
    getStatistics: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().default(50),
        days: z.number().default(7),
      }))
      .query(async ({ input }) => {
        return await getFireStatistics(
          input.latitude,
          input.longitude,
          input.radius,
          input.days
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
