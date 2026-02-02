import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, occurrences, InsertOccurrence, photos, InsertPhoto, validations, InsertValidation, simulations, InsertSimulation, alerts, InsertAlert, badges, rankings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Local authentication functions
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  loginMethod: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    loginMethod: data.loginMethod,
    openId: `local_${Date.now()}`, // Gerar um openId único para compatibilidade
    lastSignedIn: new Date(),
  });

  // Buscar o usuário criado pelo email
  const user = await getUserByEmail(data.email);
  if (!user) throw new Error("Failed to retrieve created user");
  
  return user;
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}


// Occurrence queries
export async function createOccurrence(data: InsertOccurrence) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(occurrences).values(data);
  return result;
}

export async function getOccurrenceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(occurrences).where(eq(occurrences.id, id)).limit(1);
  return result[0];
}

export async function getOccurrencesByType(type: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(occurrences)
    .where(eq(occurrences.type, type as any))
    .orderBy(desc(occurrences.createdAt))
    .limit(limit);
}

export async function getRecentOccurrences(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(occurrences)
    .orderBy(desc(occurrences.createdAt))
    .limit(limit);
}

// Photo queries
export async function addPhotos(occurrenceId: number, photoUrls: string[]) {
  const db = await getDb();
  if (!db) return [];
  const values = photoUrls.map(url => ({
    occurrenceId,
    photoUrl: url,
  }));
  return await db.insert(photos).values(values);
}

export async function getPhotosByOccurrence(occurrenceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(photos).where(eq(photos.occurrenceId, occurrenceId));
}

// Validation queries
export async function createValidation(data: InsertValidation) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(validations).values(data);
  // Update occurrence validation counts
  const occurrence = await getOccurrenceById(data.occurrenceId);
  if (occurrence) {
    const validationCount = (occurrence.communityValidations || 0) + (data.isValid ? 1 : 0);
    const rejectionCount = (occurrence.communityRejections || 0) + (!data.isValid ? 1 : 0);
    await db.update(occurrences)
      .set({ communityValidations: validationCount, communityRejections: rejectionCount })
      .where(eq(occurrences.id, data.occurrenceId));
  }
}

export async function getValidationsByOccurrence(occurrenceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(validations).where(eq(validations.occurrenceId, occurrenceId));
}

// Simulation queries
export async function createSimulation(data: InsertSimulation) {
  const db = await getDb();
  if (!db) return null;
  return await db.insert(simulations).values(data);
}

export async function getUserSimulations(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(simulations)
    .where(eq(simulations.userId, userId))
    .orderBy(desc(simulations.createdAt))
    .limit(limit);
}

// Alert queries
export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) return null;
  return await db.insert(alerts).values(data);
}

export async function getUserAlerts(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (unreadOnly) {
    return await db.select().from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  }
  return await db.select().from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.createdAt));
}

// Badge queries
export async function awardBadge(userId: number, badgeType: string) {
  const db = await getDb();
  if (!db) return null;
  return await db.insert(badges).values({ userId, badgeType: badgeType as any });
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(badges).where(eq(badges.userId, userId));
}

// Ranking queries
export async function updateUserRanking(userId: number, pointsEarned: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Update user points
  const user = await getUserByOpenId((await db.select().from(users).where(eq(users.id, userId)).limit(1))[0]?.openId || '');
  if (user) {
    await db.update(users).set({ points: (user.points || 0) + pointsEarned }).where(eq(users.id, userId));
  }
  
  // Update or create ranking
  const existingRanking = await db.select().from(rankings).where(eq(rankings.userId, userId)).limit(1);
  if (existingRanking.length > 0) {
    await db.update(rankings)
      .set({ 
        monthlyPoints: (existingRanking[0].monthlyPoints || 0) + pointsEarned,
        totalPoints: (existingRanking[0].totalPoints || 0) + pointsEarned,
      })
      .where(eq(rankings.userId, userId));
  } else {
    await db.insert(rankings).values({
      userId,
      monthlyPoints: pointsEarned,
      totalPoints: pointsEarned,
    });
  }
}

export async function getTopRankings(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rankings)
    .orderBy(desc(rankings.totalPoints))
    .limit(limit);
}

export async function getMonthlyTopRankings(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rankings)
    .orderBy(desc(rankings.monthlyPoints))
    .limit(limit);
}


// Statistics queries
export async function getOccurrenceStats() {
  const db = await getDb();
  if (!db) return null;
  
  const total = await db.select().from(occurrences);
  const byType = Object.entries(
    total.reduce((acc: Record<string, number>, occ) => {
      acc[occ.type] = (acc[occ.type] || 0) + 1;
      return acc;
    }, {})
  );
  
  const bySeverity = Object.entries(
    total.reduce((acc: Record<string, number>, occ) => {
      acc[occ.severity] = (acc[occ.severity] || 0) + 1;
      return acc;
    }, {})
  );
  
  const validated = total.filter(o => o.status === 'validated').length;
  const critical = total.filter(o => o.severity === 'critical').length;
  
  return {
    total: total.length,
    validated,
    critical,
    byType,
    bySeverity,
  };
}

// Update occurrence with risk score
export async function updateOccurrenceRiskScore(occurrenceId: number, riskScore: number) {
  const db = await getDb();
  if (!db) return null;
  return await db.update(occurrences)
    .set({ riskScore: riskScore as any })
    .where(eq(occurrences.id, occurrenceId));
}

// Get critical occurrences
export async function getCriticalOccurrences(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(occurrences)
    .where(eq(occurrences.severity, 'critical'))
    .orderBy(desc(occurrences.createdAt))
    .limit(limit);
}

// Get occurrences by status
export async function getOccurrencesByStatus(status: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(occurrences)
    .where(eq(occurrences.status, status as any))
    .orderBy(desc(occurrences.createdAt))
    .limit(limit);
}

// Mark alert as read
export async function markAlertAsRead(alertId: number) {
  const db = await getDb();
  if (!db) return null;
  return await db.update(alerts)
    .set({ isRead: true })
    .where(eq(alerts.id, alertId));
}

/**
 * Password Reset Functions
 */

// Salvar reset token para usuário
export async function savePasswordResetToken(userId: number, token: string, expiresIn24Hours: boolean = true) {
  const db = await getDb();
  if (!db) return null;

  const expiresAt = new Date();
  if (expiresIn24Hours) {
    expiresAt.setTime(expiresAt.getTime() + 24 * 60 * 60 * 1000); // 24 horas
  }

  return await db.update(users)
    .set({
      resetToken: token,
      resetTokenExpires: expiresAt,
    })
    .where(eq(users.id, userId));
}

// Verificar e validar reset token
export async function validatePasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const user = await db.select().from(users)
    .where(eq(users.resetToken, token))
    .limit(1);

  if (user.length === 0) return null;

  const resetUser = user[0];

  // Verificar se token expirou
  if (!resetUser.resetTokenExpires || new Date() > resetUser.resetTokenExpires) {
    // Limpar token expirado
    await db.update(users)
      .set({ resetToken: null, resetTokenExpires: null })
      .where(eq(users.id, resetUser.id));
    return null;
  }

  return resetUser;
}

// Limpar reset token após reset bem-sucedido
export async function clearPasswordResetToken(userId: number) {
  const db = await getDb();
  if (!db) return null;

  return await db.update(users)
    .set({
      resetToken: null,
      resetTokenExpires: null,
    })
    .where(eq(users.id, userId));
}

// Atualizar senha do usuário
export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return null;

  return await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}
