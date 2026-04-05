# Roadmap Product

**Hệ thống quản lý Roadmap Sản phẩm thông minh** – Xây dựng, theo dõi và chia sẻ roadmap với AI Tutor, Content Management và Microservices Architecture.

---

## 🌟 Giới thiệu

**Roadmap Product** là nền tảng toàn diện giúp các team Product, Engineering và Stakeholder:

- Xây dựng & quản lý Product Roadmap chuyên nghiệp
- Theo dõi tiến độ thời gian thực (Progress Tracking)
- Hỗ trợ AI Tutor thông minh
- Quản lý nội dung (Headless CMS + Markdown Editor)
- Phân quyền chi tiết và cộng tác đa người dùng

Hệ thống được thiết kế theo **Microservices Architecture**, hỗ trợ scale lớn và dễ mở rộng.

---

## ✨ Tính năng chính (Special Features)

- **AI Tutor & Roadmap Assistant** – Hướng dẫn, gợi ý và trả lời câu hỏi về roadmap
- **Content Management** – Markdown Editor, Rich Text, Metadata, Versioning
- **Progress Tracking** – Theo dõi Steps/Stages, Percentage, Timeline
- **Custom Admin Panel** – Quản lý người dùng, quyền hạn, nội dung
- **Search & Analytics** – Full-text search và báo cáo chi tiết
- **Notification System** – Real-time và email/Slack
- **Multi-role Support** – Backend Developer, Frontend, PM, Designer…

---

## 🏗️ Kiến trúc Hệ thống

Hệ thống được xây dựng theo **System Design Architecture** chi tiết (xem file `System Design Architecture cho Roadmap Product.xmind.pdf`).

- **Overall Architecture**: Microservices + Event-Driven + API Gateway
- **Frontend**: Responsive, Component-based, State Management
- **Backend**: Multiple independent services
- **Database**: SQL + NoSQL + Search Engine + Cache
- **Infrastructure**: Docker + Kubernetes + IaC (Terraform)
- **Security & Scalability**: Rate limiting, Encryption, Horizontal Scaling, CDN, Sharding

---

## 🛠️ Tech Stack

| Layer              | Công nghệ chính                                |
| ------------------ | ---------------------------------------------- |
| **Frontend**       | Next.js (React) + Tailwind CSS + Zustand/Redux |
| **Backend**        | NestJS (Node.js) / Go (Fiber)                  |
| **Monorepo**       | Turborepo                                      |
| **Database**       | PostgreSQL + Redis + Elasticsearch             |
| **API**            | REST + GraphQL                                 |
| **Auth**           | JWT + OAuth2 + RBAC + Policy-Based             |
| **Infrastructure** | Docker + Kubernetes + Terraform                |
| **CI/CD**          | GitHub Actions                                 |
| **Monitoring**     | Prometheus + Grafana + ELK Stack               |
| **Caching/CDN**    | Redis + CloudFront                             |

---

## 📁 Cấu trúc Thư mục (Monorepo)

```bash
roadmap-product/
├── apps/                  # Ứng dụng frontend
│   ├── web/               # Web chính
│   └── admin/             # Admin Panel
├── services/              # Microservices backend
│   ├── api-gateway/
│   ├── user-service/
│   ├── roadmap-service/
│   ├── content-service/
│   ├── progress-tracking-service/
│   ├── search-service/
│   ├── notification-service/
│   └── analytics-service/
├── packages/              # Shared packages
│   ├── types/
│   ├── ui/
│   └── utils/
├── infra/                 # Infrastructure as Code
│   ├── terraform/
│   ├── k8s/
│   └── docker/
├── docs/                  # Tài liệu
├── .github/               # CI/CD workflows
├── docker-compose.yml
├── turbo.json
└── README.md
```
