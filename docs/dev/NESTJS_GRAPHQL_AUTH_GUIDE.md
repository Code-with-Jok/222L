# Hướng dẫn thiết lập NestJS + GraphQL + Auth (JWT)

Tài liệu này hướng dẫn bạn xây dựng hệ thống Authentication (Đăng nhập, Đăng ký, Lấy thông tin User) sử dụng NestJS, GraphQL và JWT, kết nối trực tiếp với package `@repo/db` (Prisma) mà chúng ta vừa setup.

## Bước 1: Khởi tạo App NestJS (Nếu chưa có)

Nếu bạn chưa có app NestJS trong thư mục `apps/`, hãy tạo nó:

```bash
cd apps
npx @nestjs/cli new api
# Chọn package manager là pnpm
```

Sửa lại tên trong `apps/api/package.json` thành `"name": "api"`.

## Bước 2: Cài đặt Dependencies

Di chuyển vào thư mục `apps/api` và cài đặt các thư viện cần thiết:

```bash
cd apps/api

# Cài đặt GraphQL & Apollo
pnpm add @nestjs/graphql @nestjs/apollo @apollo/server graphql

# Cài đặt Auth, JWT & Mã hóa mật khẩu (Bcrypt)
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt

# Kết nối với package Prisma DB của chúng ta
pnpm add @repo/db@workspace:*
```

## Bước 3: Cấu hình Prisma Service

Chúng ta cần một Service trong NestJS để gọi Prisma Client từ `@repo/db`. Tạo file `apps/api/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Tạo `apps/api/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## Bước 4: Khởi tạo GraphQL & JWT trong AppModule

Cập nhật file `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true, // Bật Playground để test API
    }),
    AuthModule,
  ],
})
export class AppModule {}
```

## Bước 5: Xây dựng Module Auth (Bảo mật)

Tạo thư mục `apps/api/src/auth` và thêm các file sau:

**1. Định nghĩa Jwt Strategy (Xác thực Token) - `jwt.strategy.ts`:**
```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    // Kiểm tra xem user có tồn tại và session có hợp lệ không
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

**2. Tạo GraphQL Guard (Chắn cổng API) - `jwt-auth.guard.ts`:**
```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

**3. Tạo `auth.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '7d' }, // Token hết hạn sau 7 ngày
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
```

## Bước 6: Xây dựng GraphQL API (Resolvers & Service)

**1. Định nghĩa Data Types (GraphQL Models) - `models/user.model.ts` và `models/auth-response.model.ts`:**
```typescript
// apps/api/src/auth/models/user.model.ts
import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  role: string;
}

// apps/api/src/auth/models/auth-response.model.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
```

**2. Viết AuthService (Logic xử lý) - `auth.service.ts`:**
```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from './models/auth-response.model';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email đã tồn tại!');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hashedPassword, name },
    });

    return this.generateAuthResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu!');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Sai email hoặc mật khẩu!');

    return this.generateAuthResponse(user);
  }

  private async generateAuthResponse(user: any): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Lưu session vào DB
    await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, user };
  }
}
```

**3. Viết AuthResolver (Đầu ra GraphQL) - `auth.resolver.ts`:**
```typescript
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse } from './models/auth-response.model';
import { User } from './models/user.model';
import { LoginInput, RegisterInput } from './dto/auth.inputs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input.email, input.password);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input.email, input.password, input.name);
  }

  // API này ĐƯỢC BẢO VỆ bởi JWT
  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User) {
    return user;
  }
}
```

*(Bạn sẽ cần tạo thêm file `dto/auth.inputs.ts` chứa InputType cho Login/Register và một custom decorator `current-user.decorator.ts` để lấy user từ request).*

## Hoàn tất & Chạy thử
1. Thêm biến môi trường `DATABASE_URL` và `JWT_SECRET` vào file `apps/api/.env`.
2. Chạy server NestJS: `pnpm run start:dev`.
3. Mở trình duyệt vào `http://localhost:3000/graphql` để test các API Login, Register bằng giao diện Apollo Playground.
