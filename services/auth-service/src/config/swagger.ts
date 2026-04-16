import { DocumentBuilder } from "@nestjs/swagger";

const swaggerConfig = new DocumentBuilder()
  .setTitle("Auth Service")
  .setDescription("REST API for authentication and authorization")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

export default swaggerConfig;
