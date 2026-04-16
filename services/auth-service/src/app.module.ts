import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppResolver } from "./app.resolver";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { join } from "path";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      introspection: process.env.NODE_ENV !== "production",
      playground: false,
      path: "/graphql",
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res }: { req: unknown; res: unknown }) => {
        console.log("req:", req);
        console.log("res:", res);
        return { req, res };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
