const isProduction = process.env.NODE_ENV === "production";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (isProduction) {
    throw new Error(
      "[ENV] JWT_SECRET não está definido. Isso é obrigatório em produção " +
      "(usado para assinar/verificar sessões). Configure a variável de ambiente " +
      "ou o Secret do Kubernetes antes de subir a aplicação."
    );
  } else {
    console.warn(
      "[ENV] JWT_SECRET não definido, usando valor de desenvolvimento inseguro. " +
      "Configure JWT_SECRET no .env.local antes de ir para produção."
    );
  }
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: jwtSecret ?? "dev-only-insecure-secret-do-not-use-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
