import "dotenv/config";
import "reflect-metadata";
import { SwaggerModule } from "@nestjs/swagger";
import createApp from "./app";
import swaggerConfig from "./config/swagger";

async function bootstrap(): Promise<void> {
  const app = await createApp();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, swaggerDocument);

  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port);

  console.log(`🚀 Auth service listening on http://localhost:${port}`);
  console.log(`📖 Documentation available at http://localhost:${port}/docs`);
  console.log(`🔷 GraphQL playground at http://localhost:${port}/graphql`);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to bootstrap auth service:", error);
  process.exit(1);
});
