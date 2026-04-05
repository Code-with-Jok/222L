# Hướng dẫn setup Microfrontends từ scratch - Vietnamese

## 1. Mục tiêu

Tài liệu này hướng dẫn cách setup một hệ thống microfrontends từ đầu trong monorepo dùng:

- `pnpm workspace`
- `Turborepo`
- `Next.js`
- `@vercel/microfrontends`

Ví dụ trong repo hiện tại:

- `web`: app mặc định, chạy ở port `3000`
- `landing-page`: app con, chạy ở port `3001`
- proxy local của microfrontends: port `3024`

## 2. Kiến trúc tối thiểu

```text
root/
├─ apps/
│  ├─ web/
│  └─ landing-page/
├─ packages/
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

Trong mô hình này:

- `web` là default app
- `landing-page` là child app
- route `/landing` sẽ được proxy sang `landing-page`

## 3. Bước 1: tạo monorepo

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `package.json` ở root

```json
{
  "name": "222L",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types"
  }
}
```

### `turbo.json`

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## 4. Bước 2: tạo các app Next.js

Tạo 2 app:

- `apps/web`
- `apps/landing-page`

Mỗi app cần có tối thiểu:

- `app/`
- `package.json`
- `next.config.*`
- `tsconfig.json`

Ví dụ script trong `apps/web/package.json`:

```json
{
  "name": "web",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit"
  },
  "dependencies": {
    "@vercel/microfrontends": "^2.3.2",
    "next": "16.2.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

Ví dụ script trong `apps/landing-page/package.json`:

```json
{
  "name": "landing-page",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@vercel/microfrontends": "^2.3.2",
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  }
}
```

## 5. Bước 3: bật microfrontends trong Next config

Mỗi app Next cần wrap config bằng `withMicrofrontends`.

### `apps/web/next.config.js`

```js
import { withMicrofrontends } from "@vercel/microfrontends/next/config";

/** @type {import("next").NextConfig} */
const nextConfig = {};

export default withMicrofrontends(nextConfig);
```

### `apps/landing-page/next.config.ts`

```ts
import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default withMicrofrontends(nextConfig);
```

## 6. Bước 4: tạo file cấu hình microfrontends

Trong repo hiện tại, file nằm ở:

- [apps/web/microfrontends.json](D:\lh222k\CWJ\222L\apps\web\microfrontends.json)

Ví dụ đúng:

```json
{
  "$schema": "https://turborepo.dev/microfrontends/schema.json",
  "applications": {
    "web": {
      "development": {
        "fallback": "localhost:3000",
        "local": 3000
      }
    },
    "landing-page": {
      "development": {
        "local": 3001
      },
      "routing": [
        {
          "paths": ["/landing", "/landing/:path*"]
        }
      ]
    }
  }
}
```

### Ý nghĩa

- `web` không có `routing` nên đây là default app
- `landing-page` có `routing` nên đây là child app
- `fallback` bắt buộc phải có ở default app
- `local` phải là `number` hoặc `string`, không phải object

## 7. Bước 5: chạy local development

Chạy từ root:

```bash
pnpm dev
```

Kỳ vọng:

- `web` chạy ở `http://localhost:3000`
- `landing-page` chạy ở `http://localhost:3001`
- proxy chạy ở `http://localhost:3024`

Khi dùng microfrontends, nên truy cập qua proxy:

```text
http://localhost:3024
```

## 8. Bước 6: định tuyến giữa các app

Nếu `landing-page` có:

```json
"routing": [
  {
    "paths": ["/landing", "/landing/:path*"]
  }
]
```

Thì:

- `/landing`
- `/landing/abc`

sẽ được route sang app `landing-page`.

## 9. Bước 7: chia sẻ UI hoặc layout

Có 2 hướng phổ biến:

### Cách 1: shared package

Đặt component dùng chung trong `packages/ui`, ví dụ:

- button
- card
- typography
- theme tokens

### Cách 2: shared shell trong app mặc định

Nếu bạn muốn giữ header, banner, hoặc navigation cố định giữa các page trong cùng một app Next.js, đặt chúng trong:

- `app/layout.tsx`

Trong repo này, banner dùng chung hiện đang được đặt trong:

- [layout.tsx](D:\lh222k\CWJ\222L\apps\web\app\layout.tsx)
- [site-banner.tsx](D:\lh222k\CWJ\222L\apps\web\app\_components\site-banner.tsx)

## 10. Checklist setup từ đầu

1. Tạo monorepo với `pnpm workspace` và `turbo.json`
2. Tạo các app trong `apps/*`
3. Cài `@vercel/microfrontends` cho từng app Next
4. Wrap `next.config` bằng `withMicrofrontends`
5. Tạo `microfrontends.json` ở app chính
6. Xác định app mặc định và app con bằng `routing`
7. Gán port dev rõ ràng cho từng app
8. Chạy `pnpm dev` từ root
9. Test qua proxy `3024`
10. Thêm shared UI và shared layout nếu cần

## 11. Lỗi thường gặp

### Lỗi 1: `Invalid microfrontends config`

Ví dụ lỗi:

```text
Unable to infer if applications/web is the default app or a child app
```

Nguyên nhân thường gặp:

- `development.local` khai báo sai kiểu
- cấu trúc app không khớp schema

Sai:

```json
"local": {
  "port": 3000
}
```

Đúng:

```json
"local": 3000
```

### Lỗi 2: `EADDRINUSE: address already in use :::3024`

Nguyên nhân:

- proxy cũ vẫn đang chạy

Cách xử lý trên Windows:

```powershell
Get-NetTCPConnection -LocalPort 3024,3000,3001 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Sau đó chạy lại:

```bash
pnpm dev
```

### Lỗi 3: `spawn EPERM`

Nếu lỗi này xảy ra trong môi trường sandbox, IDE agent, hoặc terminal bị giới hạn quyền thì chưa chắc là lỗi repo.

Trong repo hiện tại:

- lỗi config microfrontends đã được sửa
- `spawn EPERM` từng xuất hiện do môi trường chạy bị giới hạn

Vì vậy nên kiểm tra:

- có đang chạy terminal thường của máy không
- có policy nào chặn `child_process.spawn` không
- có phần mềm bảo mật đang chặn Node subprocess không

### Lỗi 4: `EPERM unlink .next/...`

Nguyên nhân:

- file trong `.next` đang bị lock bởi tiến trình Node cũ

Cách xử lý:

1. dừng các tiến trình dev/server cũ
2. xóa `.next`
3. chạy lại `pnpm dev` hoặc `pnpm build`

## 12. Khuyến nghị cho repo hiện tại

- Giữ `web` làm default app
- Dùng `landing-page` cho các route marketing hoặc demo tách biệt
- Chỉ để một file `microfrontends.json` ở app chính để dễ quản lý
- Khi thêm child app mới, luôn khai báo:
  - `development.local`
  - `routing`
- Khi tên app khác tên trong `package.json`, thêm `packageName`

## 13. Lệnh kiểm tra nhanh

### Kiểm tra type

```bash
pnpm --filter web check-types
pnpm --filter landing-page lint
```

### Kiểm tra cổng đang bị chiếm

```powershell
netstat -ano | Select-String ':3024'
netstat -ano | Select-String ':3000'
netstat -ano | Select-String ':3001'
```

## 14. Kết luận

Setup microfrontends tối thiểu trong repo này xoay quanh 4 điểm:

- monorepo chuẩn với `pnpm` + `turbo`
- mỗi app là một Next.js app độc lập
- tất cả app đều dùng `withMicrofrontends`
- app chính có `microfrontends.json` đúng schema

Nếu 4 phần này đúng, việc route local qua proxy và mở rộng thêm app con sẽ khá thẳng.
