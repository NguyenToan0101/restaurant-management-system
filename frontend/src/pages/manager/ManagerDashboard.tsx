import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "@/components/branch_manager/ManagerLayout";
import ManagerOverview from "./ManagerOverview";
import BranchInfo from "./BranchInfo";
import ManagerBills from "./ManagerBills";
import ManagerStaff from "./ManagerStaff";
import ManagerPromotions from "./ManagerPromotions";
import CommingSoon from "@/pages/CommingSoon";

const ManagerDashboard = () => {
  return (
    <ManagerLayout>
      <Routes>
        <Route index element={<ManagerOverview />} />
        <Route path="branch" element={<BranchInfo />} />
        <Route path="tables" element={<CommingSoon title="Table Management" />} />
        <Route path="menu" element={<CommingSoon title="Menu Management" />} />
        <Route path="bills" element={<ManagerBills />} />
        <Route path="staff" element={<ManagerStaff />} />
        <Route path="promotions" element={<ManagerPromotions />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </ManagerLayout>
  );
};

export default ManagerDashboard;
