import "dotenv/config";
import { SwaggerModule } from "@nestjs/swagger";
import createApp from "./app";
import swaggerConfig from "./config/swagger";

async function bootstrap() {
  const app = await createApp();

  const swggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = "docs";
  SwaggerModule.setup(swaggerPath, app, swggerDocument);

  const PORT = Number(process.env.PORT);
  await app.listen(PORT);

  console.log(`🚀 Auth service listening on http://localhost:${PORT}`);
  console.log(
    `📖 Documentation available at http://localhost:${PORT}/${swaggerPath}`
  );
  console.log(`🔷 GraphQL playground at http://localhost:${PORT}/graphql`);
}

bootstrap().catch((error) => {
  console.error("❌ Auth service failed to start:", error);
  process.exit(1);
});
