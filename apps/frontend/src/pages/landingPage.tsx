import { Link } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  HeartPulse,
  Lock,
  Pill,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";

const featureCards = [
  {
    icon: Users,
    title: "Resident 360°",
    description:
      "Quản lý hồ sơ cư dân, trạng thái nhập viện, mức độ chăm sóc và thông tin liên hệ trong một màn hình.",
  },
  {
    icon: ClipboardList,
    title: "Care Plan",
    description:
      "Theo dõi vấn đề sức khỏe, mục tiêu điều trị, can thiệp chăm sóc và ghi chú quan sát hằng ngày.",
  },
  {
    icon: Pill,
    title: "eMAR Medicine",
    description:
      "Kiểm soát lịch dùng thuốc, trạng thái cấp phát và cảnh báo an toàn cho điều dưỡng.",
  },
  {
    icon: Calendar,
    title: "Doctor Schedule",
    description:
      "Lên lịch bác sĩ, quản lý ca khám, cuộc hẹn và phân bổ nguồn lực theo ngày/tuần.",
  },
];

const workflowSteps = [
  "Resident Intake",
  "Assessment",
  "Care Planning",
  "Medication Record",
  "Family & Compliance",
];

const stats = [
  { value: "24/7", label: "care visibility" },
  { value: "5+", label: "core modules" },
  { value: "HIPAA", label: "ready mindset" },
];

const roleCards = [
  {
    title: "Administrator",
    description: "Tổng quan vận hành, cư dân, lịch, báo cáo và phân quyền người dùng.",
  },
  {
    title: "Nurse / Care Staff",
    description: "Cập nhật chăm sóc, thuốc, quan sát, cảnh báo và tình trạng cư dân.",
  },
  {
    title: "Doctor / Physician",
    description: "Theo dõi lịch khám, hồ sơ lâm sàng, kế hoạch chăm sóc và chỉ định.",
  },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Landing navigation">
        <Link className="landing-brand" to={APP_ROUTES.LANDING}>
          <span className="landing-brand__icon">
            <HeartPulse size={24} />
          </span>
          <span>
            <strong>WellNest</strong>
            <small>Nursing Home Management</small>
          </span>
        </Link>

        <div className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#roles">Roles</a>
        </div>

        <div className="landing-nav__actions">
          <Link className="landing-nav__login" to={APP_ROUTES.LOGIN}>
            Login
          </Link>
          <Link className="landing-nav__signup" to={APP_ROUTES.REGISTER}>
            Register
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero__content">
          <span className="landing-eyebrow">
            <ShieldAlert size={16} />
            Modern care operations platform
          </span>

          <h1>
            Quản lý viện dưỡng lão thông minh, an toàn và dễ sử dụng hơn.
          </h1>

          <p>
            Landing page này được thiết kế theo phong cách healthcare SaaS hiện
            đại: bố cục sạch, màu xanh y tế, thẻ thông tin nổi, CTA rõ ràng và
            phù hợp với hệ thống Nursing Home Management System của nhóm.
          </p>

          <div className="landing-hero__actions">
            <Link className="landing-primary-btn" to={APP_ROUTES.LOGIN}>
              Đăng nhập hệ thống
              <ArrowRight size={18} />
            </Link>
            <Link className="landing-secondary-btn" to={APP_ROUTES.DASHBOARD}>
              Xem dashboard demo
            </Link>
          </div>

          <div className="landing-stats" aria-label="Platform highlights">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-hero__visual" aria-label="Dashboard preview">
          <div className="landing-dashboard-card landing-dashboard-card--main">
            <div className="landing-card-header">
              <div>
                <span>Today overview</span>
                <strong>Resident Care Command</strong>
              </div>
              <span className="landing-live-pill">Live</span>
            </div>

            <div className="landing-care-row landing-care-row--active">
              <span>
                <Users size={18} />
              </span>
              <div>
                <strong>128 residents</strong>
                <small>12 pending assessments</small>
              </div>
              <b>+8%</b>
            </div>

            <div className="landing-care-row">
              <span>
                <Pill size={18} />
              </span>
              <div>
                <strong>Medication rounds</strong>
                <small>34 scheduled today</small>
              </div>
              <b>92%</b>
            </div>

            <div className="landing-care-row">
              <span>
                <Calendar size={18} />
              </span>
              <div>
                <strong>Doctor visits</strong>
                <small>7 appointments</small>
              </div>
              <b>On track</b>
            </div>

            <div className="landing-progress-panel">
              <div>
                <span>Care plan completion</span>
                <strong>84%</strong>
              </div>
              <div className="landing-progress-track">
                <span />
              </div>
            </div>
          </div>

          <div className="landing-floating-card landing-floating-card--top">
            <Lock size={17} />
            <span>Secure role-based access</span>
          </div>

          <div className="landing-floating-card landing-floating-card--bottom">
            <CheckCircle size={17} />
            <span>Daily care tasks synced</span>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section__heading">
          <span className="landing-eyebrow">Core modules</span>
          <h2>Các chức năng chính đã sẵn sàng để vào hệ thống</h2>
          <p>
            Landing page đóng vai trò cửa ngõ trước đăng nhập, giúp người dùng
            hiểu nhanh hệ thống có gì trước khi vào các module nội bộ.
          </p>
        </div>

        <div className="landing-feature-grid">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="landing-feature-card" key={feature.title}>
                <span>
                  <Icon size={24} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-workflow" id="workflow">
        <div>
          <span className="landing-eyebrow">Simple workflow</span>
          <h2>Quy trình chăm sóc rõ ràng từ tiếp nhận đến theo dõi</h2>
          <p>
            Giao diện được chia thành các bước nghiệp vụ quen thuộc để BA, DEV,
            Tester và người dùng cuối dễ hiểu khi demo dự án.
          </p>
        </div>

        <div className="landing-workflow__steps">
          {workflowSteps.map((step, index) => (
            <div className="landing-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--roles" id="roles">
        <div className="landing-section__heading">
          <span className="landing-eyebrow">Role based access</span>
          <h2>Phù hợp cho nhiều vai trò trong viện dưỡng lão</h2>
        </div>

        <div className="landing-role-grid">
          {roleCards.map((role) => (
            <article className="landing-role-card" key={role.title}>
              <div className="landing-role-card__icon">
                <Building2 size={22} />
              </div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="landing-eyebrow">Ready to start</span>
          <h2>Bắt đầu sử dụng WellNest NHMS</h2>
          <p>
            Vào trang đăng nhập để tiếp tục hoặc mở dashboard demo để xem nhanh
            các module đã được gộp trong project.
          </p>
        </div>
        <div className="landing-cta__actions">
          <Link className="landing-primary-btn" to={APP_ROUTES.LOGIN}>
            Đăng nhập
            <ArrowRight size={18} />
          </Link>
          <Link className="landing-secondary-btn landing-secondary-btn--light" to={APP_ROUTES.DASHBOARD}>
            Xem demo
          </Link>
        </div>
      </section>
    </main>
  );
}
