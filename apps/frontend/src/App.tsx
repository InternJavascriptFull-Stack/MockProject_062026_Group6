import { DashboardLayout } from "./layout/DashboardLayout";
import { Patients } from "./pages/Patients";

function App() {
  return (
    <DashboardLayout>
      <Patients />
    </DashboardLayout>
  );
}

export default App;
