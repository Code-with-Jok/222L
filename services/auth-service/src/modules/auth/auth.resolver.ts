import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class AuthResolver {
  @Query(() => String)
  hello() {
    return "Hello World";
  }
}
