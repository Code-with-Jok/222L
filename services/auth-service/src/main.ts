import "dotenv/config";
import { SwaggerModule } from "@nestjs/swagger";
import createApp from "./app";
import swaggerConfig from "./config/swagger";

async function bootstrap() {
  const app = await createApp();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = "docs";
  SwaggerModule.setup(swaggerPath, app, swaggerDocument);

  const rawPort = process.env.PORT;
  const PORT = rawPort ? parseInt(rawPort, 10) : 3000;

  if (isNaN(PORT) || PORT <= 0) {
    console.warn(`⚠️ Invalid PORT "${rawPort}" specified. Falling back to 3000.`);
  }

  await app.listen(PORT || 3000);

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
