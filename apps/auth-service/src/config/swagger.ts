import { DocumentBuilder } from "@nestjs/swagger";

const swaggerConfig = new DocumentBuilder()
  .setTitle("Auth Service")
  .setDescription(
    "REST facade for the auth microservice. GraphQL operations are available at /graphql.",
  )
  .setVersion("1.0.0")
  .addBearerAuth()
  .build();

export default swaggerConfig;
