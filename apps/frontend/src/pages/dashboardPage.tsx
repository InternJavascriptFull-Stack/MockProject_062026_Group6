import { Link } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";

const modules = [
  {
    title: "Resident Management",
    description: "Resident list, intake reception, status, and care level tracking.",
    to: APP_ROUTES.RESIDENTS,
  },
  {
    title: "Resident Reception",
    description: "Admission form and resident intake assessment workflow.",
    to: APP_ROUTES.RESIDENT_RECEPTION,
  },
  {
    title: "Doctor Schedule",
    description: "Calendar views for doctor schedules and appointments.",
    to: APP_ROUTES.DOCTOR_SCHEDULE,
  },
  {
    title: "eMAR Medicine",
    description: "Medication administration records and daily medicine checks.",
    to: APP_ROUTES.EMAR,
  },
  {
    title: "Care Plan",
    description: "Active problems, goals, interventions, and observation notes.",
    to: APP_ROUTES.CARE_PLAN,
  },
  {
    title: "Login / Register",
    description: "Authentication screens from the login and sign-up branches.",
    to: APP_ROUTES.LOGIN,
  },
];

export function DashboardPage() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <span>NHMS Group 6</span>
        <h1>Nursing Home Management System</h1>
        <p>
          This merged version combines the stable integration branch with the
          remaining feature branches: forgot password, doctor schedule, eMAR,
          care plan, and additional sign-in/sign-up screens.
        </p>
      </section>

      <section className="dashboard-grid" aria-label="Project modules">
        {modules.map((module) => (
          <Link className="dashboard-card" key={module.to} to={module.to}>
            <strong>{module.title}</strong>
            <p>{module.description}</p>
            <span>Open module →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
