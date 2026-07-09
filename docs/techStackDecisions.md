---
tags: [type/concept, topic/tech]
date: 2026-06-25
aliases: [Quyết định công nghệ dự án, Tech Stack Decisions]
---

# 📌 Báo Cáo Quyết Định Công Nghệ & Các Hạng Mục Cần Thống Nhất

## TL;DR

Tài liệu ghi nhận trạng thái phê duyệt các quyết định công nghệ (Tech Stack) của dự án Quản lý viện dưỡng lão Việt Trí Đạo. Báo cáo phân loại rõ ràng các công nghệ cốt lõi đã được thống nhất (React, NestJS, Prisma, SQL Server, TS) và lập danh sách các công nghệ/công cụ còn thiếu cần được thảo luận để hoàn thiện môi trường phát triển chung cho nhóm 16 người.

---

## Core Concept

### 1. Các hạng mục ĐÃ CHỐT (Approved Stack)

Đây là các công nghệ nền tảng và thư viện bổ trợ đã được đội ngũ dự án phê duyệt và thống nhất sử dụng 100%:

- **Runtime Environment:** **Node.js LTS (v24)** — Môi trường chạy dự án Backend chính thức.
- **Package Manager:** **npm** — Trình quản lý gói chính thức (cả nhóm dùng chung npm để đồng bộ lockfile).
- **Ngôn ngữ lập trình:** **TypeScript (TS) v5.9.x** — Phiên bản được NestJS v11 hỗ trợ gốc (tránh cảnh báo peer-dependencies).
- **Frontend Framework:** **ReactJS (Vite)** — Thư viện xây dựng giao diện nhanh, nhiều thư viện hỗ trợ.
- **CSS & UI Framework:** **Tailwind CSS** & **shadcn/ui** — Thư viện viết CSS tiện lợi kết hợp UI component hiện đại.
- **Backend Framework:** **NestJS** — Khung kiến trúc modular chuẩn doanh nghiệp, tối ưu cho phân chia công việc trong nhóm 16 người.
- **Database ORM:** **Prisma ORM** — Thư viện kết nối dữ liệu tự sinh kiểu dữ liệu từ SQL Server, nâng cao trải nghiệm lập trình.
- **Cơ sở dữ liệu:** **SQL Server (MSSQL) 2022 Express** — Hệ quản trị CSDL quan hệ chạy qua Docker local để đồng bộ.
- **IDE / Editor:** **VS Code** — Công cụ lập trình chính thống nhất của cả dự án (đã có file config settings/extensions chung).
- **State Management:** **Zustand** — Quản lý trạng thái toàn cục gọn nhẹ, không boilerplate, dễ học cho intern.
- **HTTP Client & Server State:** **Axios** & **React Query** — Giao tiếp API an toàn và đồng bộ dữ liệu thời gian thực.
- **Validation:** **Class-Validator** (Backend) & **Zod** (Frontend) — Đảm bảo định dạng dữ liệu đầu vào.
- **Authentication & Authorization:** **NestJS Passport (JWT)** & **Zustand Store** — Xác thực và phân quyền RBAC dựa trên httpOnly Cookie bảo mật.
- **Date/Time Library:** **Day.js** — Tính toán ngày tháng và lịch trình điều dưỡng/viện sinh chuẩn xác.
- **Repository Architecture:** **Simple Monorepo** với npm Workspaces — Lưu trữ code FE và BE trong 1 repo duy nhất để dễ share types/config, KHÔNG dùng Turborepo để tối giản hóa cho intern.
- **Quy chuẩn Code:** **ESLint** & **Prettier** — Kiểm tra và định dạng code tự động khi lưu (Format on Save).

---

## Practical Implementation

### Chi Tiết Cấu Hình Các Quyết Định Đã Chốt

#### 1. Package Manager & Runtime: Thống nhất dùng npm và Node.js LTS (v24)

- _Quyết định:_ Cả team dùng chung trình quản lý gói **`npm`** đi kèm với **Node.js phiên bản LTS (v24)**. Cấm tuyệt đối việc sử dụng yarn, pnpm hoặc bun lẻ tẻ vì sẽ làm hỏng file `package-lock.json` chung của dự án và gây lỗi xung đột dependency khi merge code.

#### 2. SQL Server Version: Sử Dụng SQL Server 2022 Express (Qua Docker)

- _Quyết định:_ Thống nhất chạy phiên bản **SQL Server 2022 Express** thông qua **Docker** (chi tiết cấu hình và docker-compose xem tại Mục 5 bên dưới). Phương án này giúp đồng bộ môi trường giữa các thành viên dùng Windows, macOS và Linux, đồng thời tránh lỗi tương thích khi khôi phục database schema.

#### 3. Supplementary Libraries (Thư viện phụ)

Để tăng tốc độ phát triển và giảm thiểu xung đột cho nhóm 16 người, team cần thống nhất sử dụng các thư viện phụ sau cho cả Frontend và Backend:

##### a. Quản lý trạng thái ở Frontend (React State Management): **Zustand**

- **Quyết định:** Chọn **Zustand** thay vì Redux Toolkit.
- **Lý do:**
  - _Đơn giản, dễ học:_ Zustand chỉ yêu cầu định nghĩa store bằng một hàm hook đơn giản, không cần boilerplate phức tạp (như actions, reducers, types của Redux). Trong team 16 người có nhiều intern, dùng Zustand sẽ giúp các bạn làm việc hiệu quả ngay lập tức mà không viết code rác.
  - _Hiệu năng tốt:_ Zustand hỗ trợ selector mặc định, giúp tránh re-render thừa thải.
  - _Dung lượng nhẹ:_ Chỉ khoảng 1.5 KB, không làm phình bundle size của ứng dụng React.

##### b. Giao tiếp API: **Axios** kết hợp **React Query (@tanstack/react-query)**

- **Quyết định:** Sử dụng **Axios** cho việc gọi API thô và **React Query** để quản lý server state.
- **Lý do:**
  - _Quản lý Token thông minh (Axios Interceptors):_ Ứng dụng quản lý viện dưỡng lão có tính phân quyền cao (Admin, Điều dưỡng, Người nhà). Axios Interceptors giúp dễ dàng chèn JWT token vào headers hoặc tự động bắt lỗi `401 Unauthorized` để chạy cơ chế refresh token tập trung.
  - _Đồng bộ dữ liệu thời gian thực (React Query):_ Quản lý viện dưỡng lão đòi hỏi hiển thị trạng thái phòng, lịch uống thuốc của người già theo thời gian thực. React Query giúp tự động cache dữ liệu, fetch lại ngầm (refetch on window focus/interval) và xử lý phân trang vô cùng đơn giản.

##### c. Kiểm tra dữ liệu đầu vào (Validation): **Class-Validator** (Backend) & **Zod** (Frontend)

- **Quyết định:**
  - **Backend (NestJS):** Dùng cặp đôi **`class-validator`** và **`class-transformer`** cùng với `ValidationPipe` tích hợp sẵn của NestJS.
  - **Frontend (React):** Dùng **`Zod`** kết hợp với **`React Hook Form`** (`@hookform/resolvers/zod`).
- **Lý do:**
  - _Chuẩn hóa NestJS:_ NestJS sinh ra là để chạy với Class-Validator dạng Decorator (ví dụ: `@IsString()`, `@IsEmail()`, `@IsInt()`). Việc ép dùng Zod ở Backend sẽ phá vỡ quy chuẩn thiết kế của NestJS.
  - _Tối ưu hóa UI Form ở Frontend:_ React Hook Form là thư viện làm form hiệu năng cao nhất hiện tại (không re-render khi gõ). Kết hợp với Zod schema giúp kiểm tra định dạng dữ liệu phía Client nhanh chóng và đồng bộ kiểu dữ liệu TS sang Backend.

##### d. Xử lý thời gian và lịch trình: **Day.js**

- **Quyết định:** Dùng **Day.js** để xử lý toàn bộ logic ngày giờ.
- **Lý do:**
  - Dự án viện dưỡng lão có nhiều nghiệp vụ liên quan đến lịch làm việc của điều dưỡng, lịch uống thuốc của viện sinh, và hóa đơn thanh toán hàng tháng.
  - Đối tượng `Date` mặc định của JS rất nghèo nàn và dễ phát sinh lỗi định dạng vùng múi giờ. Day.js nhẹ (chỉ 2KB), API giống Moment.js cũ nên rất dễ học và an toàn khi tính toán ngày tháng.

##### e. Thư viện Authentication & Authorization (Xác thực & Phân quyền): Custom JWT với **NestJS Passport** & **Zustand Store**

- **Quyết định:**
  - **Backend:** Sử dụng thư viện chính thức **`@nestjs/jwt`** kết hợp với **`@nestjs/passport`** (Passport JWT Strategy).
  - **Frontend:** Thiết lập **Zustand Store** (`useAuthStore`) để quản lý trạng thái đăng nhập toàn cục (`currentUser`, `isAuthenticated`, `role`). Đối với việc lưu trữ phiên đăng nhập khi F5 (Persistence): Khuyến nghị gọi API `/auth/me` từ Backend khi ứng dụng khởi chạy (Rehydration) để lấy lại thông tin user từ `httpOnly` cookie bảo mật (hoặc sử dụng middleware `persist` của Zustand lưu vào `localStorage` nếu muốn đơn giản).
- **Lý do:**
  - _Chuẩn hóa & Tài liệu phong phú:_ Đây là phương pháp xác thực tiêu chuẩn, được NestJS tài liệu hóa chi tiết nhất. Interns rất dễ dàng tìm kiếm tài liệu hướng dẫn và sửa lỗi trên StackOverflow.
  - _Phân quyền (RBAC) mạnh mẽ cho Viện dưỡng lão:_ Dự án cần phân quyền cực kỳ chặt chẽ (Admin, Bác sĩ, Điều dưỡng, Người nhà). Sử dụng NestJS Guards (`AuthGuard`, `RolesGuard`) kết hợp Decorator `@Roles()` giúp chặn các request không hợp lệ ngay tại tầng Controller Backend rất dễ dàng.
  - _Bảo mật & Tự chủ dữ liệu:_ Do dự án triển khai cho thị trường Việt Nam và lưu trữ thông tin sức khỏe nhạy cảm, việc dùng JWT tự quản lý giúp lưu thông tin tài khoản trực tiếp trong SQL Server nội địa, không bị phụ thuộc vào bên thứ ba (như Firebase, Clerk, Auth0) và tránh chi phí phát sinh khi mở rộng quy mô người dùng.

#### 4. Repo Architecture (Cấu trúc Repository): Simple Monorepo với npm Workspaces

- **Quyết định:** Sử dụng **01 Monorepo đơn giản** (đặt code Frontend React và Backend NestJS trong cùng một Git Repository, ví dụ: thư mục `apps/frontend` và `apps/backend`), quản lý bằng **npm Workspaces** và **KHÔNG dùng Turborepo**.
- **Lý do:**
  1. _Chia sẻ kiểu dữ liệu trực tiếp (Shared Types/DTOs):_ Đối với dự án 16 người, việc đồng bộ API contract giữa FE và BE rất dễ bị lệch nếu sửa đổi ở 2 repo khác nhau. Khi dùng Monorepo với npm Workspaces, team có thể tạo một folder shared (ví dụ: `packages/types` hoặc import trực tiếp từ file schema backend) để đồng bộ kiểu dữ liệu/DTOs tức thời mà không cần copy tay hay chạy xuất file thủ công.
  2. _Tập trung hóa cấu hình (Centralized Configs):_ Toàn bộ Docker (file `docker-compose.yml` để chạy SQL Server), file cấu hình môi trường `.env.example`, các hướng dẫn phát triển và cấu hình IDE VS Code dùng chung đều được lưu trữ và quản lý thống nhất tại một nơi duy nhất.
  3. _Đơn giản tối đa cho Interns:_ Bằng việc loại bỏ Turborepo (không cần file `turbo.json`, không cần cài thêm CLI toàn cục hay học cách quản lý build pipeline phức tạp), các bạn intern chỉ cần thao tác bằng lệnh npm tiêu chuẩn thông qua cờ `--workspace` hoặc mở trực tiếp thư mục `apps/frontend` hoặc `apps/backend` để phát triển độc lập như bình thường.

- **Mẫu cấu trúc thư mục của Simple Monorepo:**

```text
MockProject_Group6/           # Root của Git Repository dùng chung
├── apps/
│   ├── frontend/             # Ứng dụng Frontend ReactJS (Vite, Tailwind, Zustand)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backend/              # Ứng dụng Backend NestJS (Prisma ORM, Passport)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared-types/         # Thư mục shared chứa kiểu dữ liệu, schema validation dùng chung
│       ├── index.ts
│       └── package.json
├── .vscode/                  # Cấu hình IDE VS Code dùng chung cho cả team
│   ├── extensions.json
│   └── settings.json
├── docker-compose.yml        # Chạy SQL Server 2022 Express bằng Docker cho cả nhóm
├── .env.example              # File mẫu cấu hình các biến môi trường
├── .gitignore                # Quản lý các file bỏ qua không commit lên Git
├── package.json              # Config root quản lý workspaces và npm script dùng chung
└── README.md                 # Hướng dẫn setup và phát triển chi tiết cho dự án
```

#### 5. Phương Án Triển Khai SQL Server Local: Sử Dụng Docker

Để đồng bộ môi trường phát triển cho team 16 người (tránh việc một số thành viên dùng macOS không cài được SQL Server trực tiếp), team cần thống nhất chạy SQL Server 2022 Express qua Docker:

- **Tại sao nên dùng Docker:**
  - _Đa nền tảng (Cross-platform):_ Windows, macOS và Linux đều chạy chung một container mượt mà.
  - _Cô lập tài nguyên:_ Dễ dàng bật/tắt khi code qua Docker Desktop, không làm nặng máy như khi chạy service Windows ngầm.
  - _Dễ khôi phục:_ Nếu dữ liệu lỗi, chỉ cần xóa container và chạy lại lệnh.
- **Các thông số cần thống nhất để đồng bộ file `.env` chung:**
  - _Cổng kết nối:_ Mặc định `1433`.
  - _Mật khẩu SA dùng chung:_ Đặt một mật khẩu đủ mạnh trong file `.env.example` (Ví dụ: `YourStrongPassword123!`).
  - _Tên database chung:_ `nursing_home_db`.

##### a. Mẫu file `docker-compose.yml` đặt tại root project

```yaml
version: "3.8"

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: mssql_nursing_home
    ports:
      - "1433:1433"
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=YourStrongPassword123!
      - MSSQL_PID=Express
    volumes:
      - mssql_data:/var/opt/mssql

volumes:
  mssql_data:
```

##### b. Hướng dẫn cài đặt và vận hành Docker cho cả team

1. **Cài đặt Docker:**
   - **Windows & macOS:** Tải và cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).
     - _Lưu ý trên Windows:_ Hãy chắc chắn rằng WSL 2 đã được bật để Docker chạy với hiệu năng tốt nhất.
     - _Lưu ý trên macOS (chip Apple Silicon M1/M2/M3):_ Docker Desktop tự động hỗ trợ giả lập Rosetta 2 để chạy container mssql x86_64 mượt mà.
   - **Linux (Ubuntu/Debian/Arch):** Cài đặt Docker Engine thông qua repository chính thức và cài thêm `docker-compose-plugin`.
2. **Khởi chạy SQL Server:**
   - Đảm bảo ứng dụng Docker Desktop đã được bật và đang chạy ngầm.
   - Mở Terminal tại thư mục gốc của dự án (`MockProject_Group6`) và chạy lệnh sau để kéo image và khởi chạy container ngầm:

     ```bash
     docker compose up -d
     ```

   - Kiểm tra trạng thái container bằng lệnh:

     ```bash
     docker ps
     ```

     Nếu thấy container `mssql_nursing_home` có trạng thái `Up`, nghĩa là cơ sở dữ liệu đã sẵn sàng kết nối.

3. **Kết nối Database từ Prisma (Backend):**
   - Tạo file `.env` từ file `.env.example` ở root dự án và điền chuỗi kết nối Prisma dùng chung:

     ```env
     DATABASE_URL="sqlserver://localhost:1433;database=nursing_home_db;user=sa;password=YourStrongPassword123!;encrypt=true;trustServerCertificate=true;"
     ```

   - Chạy lệnh sau để đồng bộ schema cơ sở dữ liệu lên container Docker:

     ```bash
     npx prisma db push
     ```

4. **Dừng database khi không sử dụng:**
   - Để tiết kiệm tài nguyên máy tính khi tắt code, chạy lệnh sau ở thư mục gốc:

     ```bash
     docker compose down
     ```

     _(Dữ liệu của cơ sở dữ liệu sẽ không bị mất vì đã được mount an toàn vào volume `mssql_data` trên máy chủ)._

---

## Related Notes

- [[Docs/Backend_Frameworks_Comparison]] — So sánh chi tiết các framework Node.js và hướng dẫn cấu hình SQL Server.
- [[000_VietTriDao_MOC]] — Bản đồ thông tin tổng quan của dự án thực tập.
