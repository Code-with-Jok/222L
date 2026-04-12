# Thiết kế API Gateway (Kong / Nginx) cho Dự án 222L (Roadmap Product)

Với vai trò Senior Solution Architect, dưới đây là bản thiết kế tổng thể và kế hoạch triển khai API Gateway cung cấp các tính năng Rate Limit, Authentication, Load Balancing, và SSL Termination cho hệ thống Roadmap Product.

## 1. Thiết kế Kiến trúc Hệ thống

API Gateway đóng vai trò là điểm vào duy nhất (Single Point of Entry) cho tất cả các request từ Client (Web/Mobile) đi vào các Microservices Backend của dự án 222L.

### Sơ đồ luồng xử lý (Traffic Flow)
```text
[ Clients (Web, Admin) ]
           |
           v
[ Cloudflare/AWS WAF ] (Tuỳ chọn: DDoD Protection, Global CDN)
           |
           v
[ API Gateway (Kong / Nginx) ] --(SSL Termination)
           |
           |-- 1. Rate Limiter (Redis-based)
           |-- 2. Auth Plugin (JWT Verification / OAuth2) -> Forward to User Service/Auth Service if needed
           |-- 3. Routing & Load Balancing (Round-Robin/Least Connections)
           |
           v
-----------------------------------------------------------
|                  K8s Internal Network                   |
|                                                         |
|  [User Service]   [Roadmap Service]   [Content Service] |
|                                                         |
-----------------------------------------------------------
```

### Các thành phần chính (Key Capabilities)
- **SSL Termination:** Offload việc giải mã SSL/TLS tại Gateway để giảm tải cho các microservices phía sau.
- **Authentication (Auth):** Xác thực JWT ở tầng Gateway, đảm bảo chỉ các request hợp lệ mới đi vào hệ thống nội bộ.
- **Rate Limiting:** Giới hạn số lượng request theo IP hoặc UserID để chống Spam/DDoS ở tầng ứng dụng, sử dụng Redis làm store.
- **Load Balancing:** Phân phối traffic đồng đều đến các instance của từng microservice (nếu không dùng K8s Service Loadbalancer).

## 2. Phân tích & Lựa chọn Công nghệ

Có 2 ứng cử viên sáng giá là **Nginx** và **Kong API Gateway**.

| Tiêu chí | Nginx (Mã nguồn mở) | Kong (API Gateway) |
| :--- | :--- | :--- |
| **Bản chất** | Web Server, Reverse Proxy | API Gateway chuyên dụng (xây dựng trên NGINX & OpenResty) |
| **Plugin Ecosystem** | Cần tự cấu hình (Lua script) | Có sẵn hàng trăm plugin (Rate limiting, JWT, OAuth, CORS...) |
| **Quản trị / UI** | Chỉnh sửa file config tĩnh (`nginx.conf`) | Có Admin API và các UI (Konga / Kong Manager) |
| **Dynamic Routing** | Khó (cần reload config `nginx -s reload`) | Cập nhật real-time không downtime qua Database (PostgreSQL/Cassandra) |
| **Phù hợp với K8s** | Có (Nginx Ingress Controller) | Rất tốt (Kong Ingress Controller, dễ quản lý qua CRD) |

**Quyết định lựa chọn: KONG API GATEWAY**

*Lý do:* Hệ thống 222L là kiến trúc Microservices và dự kiến có nhiều dịch vụ (User, Roadmap, Content, Analytics...). Kong cung cấp khả năng cấu hình *Dynamic*, mở rộng thông qua các plugin chuẩn bị sẵn, tích hợp Native với Kubernetes (Kong Ingress) và dễ dàng quản trị rate-limit, JWT auth bằng declarative config (yaml) rất phù hợp với Terraform và hệ sinh thái hiện tại.

## 3. Đánh giá Rủi ro (Risk Assessment)

1. **Single Point of Failure (SPOF):**
   - *Rủi ro:* Nếu API Gateway chết, toàn bộ hệ thống sập.
   - *Giải pháp:* Triển khai Kong dưới dạng Cluster hoặc sử dụng ReplicaSet trong Kubernetes (tối thiểu 2 replicas) + Auto-scaling.
2. **Độ trễ (Latency Overhead):**
   - *Rủi ro:* Mọi request phải đi qua Gateway cộng thêm trễ từ Rate Limiter (Redis) và Auth.
   - *Giải pháp:* Đặt Redis caching cực gần Kong (cùng VPC/Node), tối ưu hoá Plugin JWT để cache key, sử dụng Keep-Alive.
3. **Quản lý Configuration phức tạp:**
   - *Rủi ro:* Với nhiều service, việc cập nhật routing có thể gặp lỗi con người.
   - *Giải pháp:* Quản lý cấu hình thông qua GitOps (declarative configuration với Kong DB-less mode hoặc Kong Ingress Controller trên K8s).
4. **Bảo mật Admin API (Kong):**
   - *Rủi ro:* Admin API bị lộ có thể khiến hacker chiếm quyền điều khiển hệ thống.
   - *Giải pháp:* Admin API chỉ được expose ở mạng nội bộ (Internal network/VPC) hoặc bảo vệ qua mTLS / Basic Auth mạnh.

## 4. Triển khai với cấu trúc Codebase 222L

Hiện tại dự án 222L là một Monorepo dùng Turborepo với cấu trúc dự kiến có thư mục `services/api-gateway` và `infra/`.

**Bước 1: Khởi tạo Infra / Docker cho API Gateway**
Sử dụng Kong DB-less mode (quản lý config bằng file yaml) để dễ tích hợp CI/CD và GitOps.

- Tạo thư mục `services/api-gateway/` (hoặc cấu hình trực tiếp vào `infra/docker/kong/`).
- Tạo file cấu hình Declarative `kong.yml`:
  Trong này định nghĩa các `services` (user-service, roadmap-service), `routes`, và các `plugins` (jwt, rate-limiting).

**Bước 2: Cập nhật Docker Compose (cho Local Development)**
Thêm Kong và Redis vào `docker-compose.yml` ở thư mục gốc để dev có thể run toàn bộ hệ thống ở máy local.
```yaml
  kong:
    image: kong:3.4-ubuntu
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: "/usr/local/kong/declarative/kong.yml"
      KONG_PROXY_ACCESS_LOG: "/dev/stdout"
      KONG_ADMIN_ACCESS_LOG: "/dev/stdout"
      KONG_PROXY_ERROR_LOG: "/dev/stderr"
      KONG_ADMIN_ERROR_LOG: "/dev/stderr"
      KONG_ADMIN_LISTEN: "0.0.0.0:8001"
    ports:
      - "8000:8000" # Proxy
      - "8443:8443" # SSL Proxy
    volumes:
      - ./services/api-gateway/kong.yml:/usr/local/kong/declarative/kong.yml
```

**Bước 3: Cấu hình Kubernetes & Terraform (Môi trường Staging/Prod)**
Trong thư mục `infra/k8s/`, định nghĩa Kong Ingress Controller.
- Cấu hình SSL Termination bằng cách gắn TLS Secret (Cert-manager) vào Kong Ingress.
- Cấu hình KongPlugin CRDs trong K8s để enable Rate Limit và JWT Auth:
  - `KongPlugin` cho **rate-limiting**: Giới hạn ví dụ 100 req/min/IP.
  - `KongPlugin` cho **jwt**: Trỏ public key về Auth service hoặc lưu dưới dạng secret để verify ngay tại Gateway.

**Bước 4: Load Balancing**
Trong Kubernetes, bản thân K8s Service đã đóng vai trò Load Balancer nội bộ (Round-Robin). Kong chỉ cần proxy traffic vào DNS nội bộ của K8s (ví dụ: `user-service.default.svc.cluster.local`) là K8s sẽ tự động cân bằng tải xuống các Pods của dịch vụ đó.

**Tổng kết:** Việc đưa Kong API Gateway vào theo kiến trúc DB-less hoặc Kong Ingress cho K8s sẽ đảm bảo tính hiện đại, đúng triết lý Microservices của dự án 222L, và hoàn toàn phù hợp với Monorepo (Turborepo) khi mọi config về API Gateway được lưu trữ tập trung tại `services/api-gateway` và `infra/`.
