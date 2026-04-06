# Hướng dẫn setup shadcn/ui cho monorepo `222L`

Tài liệu này bám theo cấu trúc thực tế của repo hiện tại:

- root dùng `pnpm workspace` + `turbo`
- có 2 app Next.js trong `apps/`
- có shared UI package trong `packages/ui`
- `landing-page` đã có Tailwind CSS v4
- `web` hiện chưa có Tailwind/shadcn wiring đầy đủ

Mục tiêu của setup này là:

1. `packages/ui` là nơi chứa shared components của shadcn/ui.
2. `apps/web` và `apps/landing-page` là nơi tiêu thụ component.
3. CLI của shadcn có thể chạy được trong monorepo.
4. App code có thể import gọn bằng `@repo/ui`.

## 1. Ảnh chụp trạng thái hiện tại của repo

Những gì repo đang có sẵn:

- `package.json` ở root đã chạy `turbo run ...`
- `pnpm-workspace.yaml` đã khai báo `apps/*` và `packages/*`
- `packages/ui` đã có:
  - `src/components/ui/button.tsx`
  - `src/components/ui/card.tsx`
  - `src/lib/utils.ts`
  - `src/index.ts`
  - `src/shadcn.css`
- `apps/landing-page/app/globals.css` đã import `@repo/ui/shadcn.css`
- `apps/web` đã phụ thuộc `@repo/ui`

Những gì còn thiếu nếu muốn dùng đúng flow monorepo của shadcn CLI:

- `apps/web/components.json`
- `apps/landing-page/components.json`
- `apps/web` chưa có Tailwind v4/PostCSS setup giống `landing-page`
- `packages/ui/components.json` hiện còn tối giản, nên nên chuẩn hóa lại theo alias monorepo

## 2. Kiến trúc khuyến nghị cho repo này

```text
apps/
  landing-page/
    app/
    components.json
    package.json
    tsconfig.json
  web/
    app/
    components.json
    package.json
    tsconfig.json
packages/
  ui/
    src/
      components/
        ui/
          button.tsx
          card.tsx
      lib/
        utils.ts
      shadcn.css
      index.ts
    components.json
    package.json
    tsconfig.json
```

## 3. Nguyên tắc setup cho monorepo này

Với repo này, nên chia trách nhiệm như sau:

- `packages/ui` giữ toàn bộ shared shadcn components.
- Mỗi app có `components.json` riêng để CLI biết app nào đang gọi lệnh.
- Tailwind CSS được import ở app, nhưng token và class base được đặt trong `@repo/ui/shadcn.css`.
- App code viết tay nên import từ `@repo/ui`.
- CLI có thể sinh import deep path như `@repo/ui/components/ui/button`; điều đó vẫn hợp lệ.

## 4. Chuẩn hóa `packages/ui`

### 4.1. `packages/ui/package.json`

Repo hiện tại đã gần đúng. Điểm quan trọng là package này phải:

- có tên package là `@repo/ui`
- có root export
- có subpath export cho `components/*` và `lib/*`
- có `types` trỏ tới source hoặc declaration thật sự tồn tại

Mẫu đang phù hợp với repo:

```json
{
  "name": "@repo/ui",
  "private": true,
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./shadcn.css": "./src/shadcn.css",
    "./components/*": {
      "types": "./src/components/*.tsx",
      "import": "./src/components/*.tsx",
      "default": "./src/components/*.tsx"
    },
    "./lib/*": {
      "types": "./src/lib/*.ts",
      "import": "./src/lib/*.ts",
      "default": "./src/lib/*.ts"
    }
  }
}
```

### 4.2. `packages/ui/src/index.ts`

Nên re-export những component dùng nhiều để app import gọn:

```ts
export * from "./components/ui/button"
export * from "./components/ui/card"
export * from "./lib/utils"
```

### 4.3. `packages/ui/tsconfig.json`

Repo hiện tại đang dùng được. Mục tiêu chính là để package UI resolve được source nội bộ:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/ui/*": ["src/*"]
    }
  }
}
```

### 4.4. `packages/ui/components.json`

File hiện tại trong repo còn tối giản. Nếu muốn dùng shadcn CLI đúng flow monorepo, nên đổi về dạng này:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/shadcn.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@repo/ui/components",
    "hooks": "@repo/ui/hooks",
    "lib": "@repo/ui/lib",
    "utils": "@repo/ui/lib/utils",
    "ui": "@repo/ui/components/ui"
  }
}
```

Lưu ý:

- `style`, `baseColor`, `iconLibrary` nên đồng bộ với các app.
- Với Tailwind CSS v4, `tailwind.config` để trống.
- Repo này đang dùng thư mục `src/components/ui`, nên alias `ui` nên trỏ vào `@repo/ui/components/ui`.

## 5. Chuẩn hóa app consumer

Theo docs chính thức của shadcn cho monorepo, mỗi workspace tiêu thụ component đều nên có `components.json` riêng.

### 5.1. `apps/landing-page`

App này hiện đã gần sẵn sàng nhất vì:

- đã có Tailwind v4
- đã có PostCSS
- đã import `@repo/ui/shadcn.css`

Nên tạo thêm `apps/landing-page/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@repo/ui/lib/utils",
    "ui": "@repo/ui/components/ui"
  }
}
```

`apps/landing-page/tsconfig.json` nên giữ:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@repo/ui": ["../../packages/ui/src/index.ts"],
      "@repo/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

`apps/landing-page/package.json` nên để `@repo/ui` trong `dependencies`, không chỉ ở `devDependencies`.

### 5.2. `apps/web`

App này hiện chưa sẵn sàng để dùng shadcn/Tailwind theo cùng pattern với `landing-page`.

Muốn dùng được, cần làm thêm:

1. Cài Tailwind v4 + PostCSS:

```bash
pnpm --filter web add -D tailwindcss @tailwindcss/postcss
```

2. Tạo `apps/web/postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
```

3. Import shared shadcn CSS vào `apps/web/app/globals.css`:

```css
@import "@repo/ui/shadcn.css";

@source "../../../../packages/ui/src/**/*.tsx";
```

4. Tạo `apps/web/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@repo/ui/lib/utils",
    "ui": "@repo/ui/components/ui"
  }
}
```

5. Giữ `apps/web/tsconfig.json` có path mapping:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@repo/ui": ["../../packages/ui/src/index.ts"],
      "@repo/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

## 6. CSS/Tailwind cho package dùng chung

Repo hiện tại đang dùng `packages/ui/src/shadcn.css`:

```css
@import "tailwindcss";

@theme inline {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-destructive: oklch(0.577 0.245 27.325);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0 0);
  --color-border: oklch(0.922 0 0);
  --color-ring: oklch(0.708 0 0);
  --color-muted-foreground: oklch(0.469 0 0);
}
```

Mô hình này hợp lý cho monorepo:

- token nằm ở package UI
- app chỉ import CSS từ package
- app thêm `@source` để Tailwind quét class trong `packages/ui/src`

Nếu app không có `@source "../../../../packages/ui/src/**/*.tsx";` thì class trong shared component có thể không sinh ra CSS.

## 7. Cách chạy shadcn CLI trong repo này

Không chạy CLI trong `packages/ui` nếu mục tiêu là flow monorepo tiêu chuẩn của shadcn.

Nên chạy từ app đang tiêu thụ UI, ví dụ:

```bash
pnpm dlx shadcn@latest add button -c apps/landing-page
pnpm dlx shadcn@latest add card dialog input -c apps/landing-page
```

Hoặc:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Điều kiện để cách này chạy đúng:

- app có `components.json`
- `packages/ui` có `components.json`
- alias trong hai file match nhau
- `style`, `baseColor`, `iconLibrary` giống nhau

## 8. Cách import component sau khi setup

### 8.1. Cách dùng khuyến nghị cho code viết tay

```tsx
import { Button, Card } from "@repo/ui"
```

Lý do:

- gọn hơn
- editor dễ auto-import hơn
- app không phụ thuộc vào layout thư mục sâu trong package

### 8.2. Cách import CLI có thể sinh ra

```tsx
import { Button } from "@repo/ui/components/ui/button"
```

Cách này vẫn hợp lệ nếu export map trong `packages/ui/package.json` đúng.

## 9. Checklist xác minh sau setup

Sau khi setup xong, nên chạy:

```bash
pnpm --filter @repo/ui check-types
pnpm --filter web check-types
pnpm --filter landing-page exec tsc --noEmit
pnpm dev
```

Nếu app đã import `Button` và render được mà không lỗi style, nghĩa là:

- path mapping ổn
- export map ổn
- CSS shared package đang được app load
- Tailwind đã quét được class từ `packages/ui`

## 10. Lỗi thường gặp trong chính repo này

### 10.1. Không có auto-import/suggest cho `Button`

Nguyên nhân hay gặp:

- mở VS Code ở subfolder thay vì root repo
- TypeScript server đang cache cấu hình cũ
- app không có path mapping `@repo/ui`
- `@repo/ui` chỉ nằm trong `devDependencies`
- package `@repo/ui` trỏ `types` vào file `dist` chưa tồn tại

Cách xử lý:

1. Mở đúng root `D:\\lh222k\\CWJ\\222L`
2. Chọn `TypeScript: Use Workspace Version`
3. Chạy `TypeScript: Restart TS Server`
4. Nếu cần, `Developer: Reload Window`

### 10.2. Component render nhưng mất style

Thường do:

- app chưa import `@repo/ui/shadcn.css`
- thiếu `@source "../../../../packages/ui/src/**/*.tsx";`
- app chưa có Tailwind v4/PostCSS config

### 10.3. CLI không biết cài component vào đâu

Thường do:

- thiếu `components.json` ở app
- alias `ui` hoặc `utils` sai
- `style` hoặc `baseColor` giữa app và package UI không khớp

## 11. Thiết lập tối thiểu tôi khuyến nghị cho repo này

Nếu chỉ muốn có setup sạch và dùng được ngay, làm theo thứ tự sau:

1. Giữ `packages/ui` là shared package duy nhất cho shadcn.
2. Chuẩn hóa `packages/ui/components.json`.
3. Tạo `components.json` cho `apps/landing-page`.
4. Setup Tailwind v4 cho `apps/web`.
5. Tạo `components.json` cho `apps/web`.
6. Chạy `pnpm dlx shadcn@latest add button -c apps/landing-page`.
7. Import thủ công trong app bằng `import { Button } from "@repo/ui"`.

## 12. Nguồn tham khảo chính thức

- Monorepo: https://ui.shadcn.com/docs/monorepo
- components.json: https://ui.shadcn.com/docs/components-json
- CLI: https://ui.shadcn.com/docs/cli
- Next.js installation: https://ui.shadcn.com/docs/installation/next
