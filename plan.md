# Kế hoạch Thiết kế và Triển khai API Gateway cho Project 222L

Dưới góc độ là một **Senior Solution Architect**, tôi xin đề xuất bản kế hoạch chi tiết cho việc thiết kế và triển khai API Gateway (Kong/Nginx) tích hợp Rate limit, Auth, Load balance và SSL termination cho dự án hiện tại.

## 1. Thiết kế Kiến trúc Hệ thống (System Architecture)

### 1.1. Mô hình luồng dữ liệu
API Gateway đóng vai trò là "Cửa ngõ" duy nhất. Mọi yêu cầu từ Internet phải đi qua Gateway trước khi chạm đến các Microservices nội bộ.

**Luồng xử lý (Request Lifecycle):**
1.  **Client** gửi request HTTPS đến domain (ví dụ: `api.roadmap.com`).
2.  **SSL Termination**: Gateway giải mã SSL, kiểm tra chứng chỉ.
3.  **Global Policies**:
    - **Rate Limiting**: Kiểm tra IP/User có vượt quá hạn mức không.
    - **Security**: Chống SQL Injection, XSS cơ bản.
4.  **Authentication**: Gateway kiểm tra JWT Token hoặc API Key (có thể gọi sang `user-service` hoặc tự giải mã nếu dùng Shared Secret).
5.  **Service Discovery & Load Balancing**: Gateway xác định service đích (ví dụ: `roadmap-service`) và chọn một instance khả dụng để forward request.
6.  **Microservices**: Xử lý logic và trả kết quả về Gateway.
7.  **Response**: Gateway nhận kết quả, có thể nén (Gzip) và gửi lại cho Client.

---

## 2. Phân tích & Lựa chọn công nghệ

### So sánh Kong vs Nginx

| Tính năng | Nginx (Open Source) | Kong Gateway |
| :--- | :--- | :--- |
| **Load Balancing** | Rất mạnh, ổn định. | Dựa trên Nginx, kế thừa toàn bộ sức mạnh. |
| **Plugin System** | Hạn chế, cần compile lại hoặc dùng Lua. | **Cực mạnh**, hàng trăm plugin có sẵn (Auth, Rate limit, Log...). |
| **Quản lý (Admin)** | Qua file config (.conf), cần reload. | **Admin API** hoặc Declarative Config (YAML), không cần downtime. |
| **Authentication** | Cơ bản (Basic Auth, JWT cần module ngoài). | Hỗ trợ tận răng: JWT, OAuth2, OpenID Connect, Key Auth. |
| **Khả năng Scale** | Thủ công. | Dễ dàng scale theo chiều ngang, hỗ trợ DB-less mode. |

**==> Lựa chọn đề xuất: Kong Gateway.**
*Lý do:* Dự án 222L có định hướng Microservices rõ ràng. Kong giúp giảm tải việc code các logic lặp lại (Auth, Rate limit) ở từng service, cho phép team tập trung vào Business Logic.

---

## 3. Đánh giá rủi ro (Risk Assessment)

1.  **Điểm chết duy nhất (Single Point of Failure):** Nếu Gateway sập, toàn bộ hệ thống sập.
    - *Giải pháp:* Triển khai Kong Cluster (ít nhất 2 nodes) phía sau một Cloud Load Balancer (AWS ALB, Cloudflare).
2.  **Độ trễ (Latency):** Việc thêm một lớp trung gian sẽ tăng khoảng 5-20ms mỗi request.
    - *Giải pháp:* Sử dụng Kong DB-less mode để giảm truy vấn database, tối ưu hóa các plugin Lua.
3.  **Quản lý cấu hình phức tạp:** Khi số lượng service tăng lên, file config sẽ phình to.
    - *Giải pháp:* Sử dụng **Kong Deck** hoặc **Terraform** để quản lý cấu hình dưới dạng code (GitOps).
4.  **Bảo mật nội bộ:** Nếu kẻ tấn công bypass được Gateway để gọi trực tiếp vào Microservice.
    - *Giải pháp:* Cấu hình Network ACLs/Security Groups chỉ cho phép Microservices nhận traffic từ IP của Gateway.

---

## 4. Triển khai với cấu trúc codebase Project 222L

Dựa trên cấu trúc Monorepo hiện tại sử dụng **Turborepo** và **pnpm**, chúng ta sẽ tích hợp API Gateway như một phần của hạ tầng (Infrastructure as Code).

### 4.1. Cấu trúc thư mục đề xuất
Chúng ta sẽ thêm folder `infra` để quản lý các thành phần vận hành:

```text
roadmap-product/
├── apps/                  # Next.js web, admin
├── services/              # Các Microservices (User, Roadmap...)
├── infra/                 # <--- Thêm mới
│   ├── kong/
│   │   ├── declarative/
│   │   │   └── kong.yml       # Cấu hình Routes, Services, Plugins
│   │   ├── certs/             # SSL Certificates (cho môi trường dev)
│   │   └── docker-compose.yml # Chạy Gateway local
├── package.json
├── turbo.json
```

### 4.2. Kế hoạch hành động (Action Plan)

**Bước 1: Thiết lập môi trường Development**
- Tạo `infra/kong/docker-compose.yml` để chạy Kong Gateway.
- Sử dụng **DB-less mode** để cấu hình mọi thứ qua file `kong.yml`.

**Bước 2: Cấu hình SSL & Load Balance**
- Cấu hình Kong lắng nghe cổng 443.
- Map các upstream service:
  - `http://api.roadmap.com/v1/users` -> `user-service:3001`
  - `http://api.roadmap.com/v1/roadmaps` -> `roadmap-service:3002`

**Bước 3: Tích hợp Plugins**
- **Auth**: Kích hoạt plugin `jwt`. Các request không có token hợp lệ sẽ bị block ngay tại Gateway.
- **Rate Limit**: Cấu hình `rate-limiting` plugin (ví dụ: 100 req/min cho mỗi consumer).

**Bước 4: Tích hợp vào Workflow của Monorepo**
- Thêm script vào `package.json` gốc:
  ```json
  "scripts": {
    "infra:up": "docker-compose -f infra/kong/docker-compose.yml up -d",
    "infra:stop": "docker-compose -f infra/kong/docker-compose.yml stop"
  }
  ```
- Cập nhật tài liệu hướng dẫn (README.md) để các developer khác có thể khởi động Gateway khi phát triển local.

**Bước 5: CI/CD & Production**
- Sử dụng GitHub Actions để validate file `kong.yml`.
- Khi deploy lên K8s (như trong định hướng kiến trúc), sử dụng **Kong Ingress Controller** để quản lý tự động.

---
*Người lập kế hoạch: Senior Solution Architect (Jules).*
