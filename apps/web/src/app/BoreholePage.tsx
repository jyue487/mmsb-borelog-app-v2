import type { Borehole } from "@mmsb/core";
import { useLocation, useNavigate, useParams } from "react-router";

function useBoreholeState() {
  const { state } = useLocation();
  return state as Borehole | null;
}

export default function BoreholePage() {
  const navigate = useNavigate();
  const { projectCode, boreholeName } = useParams();
  const borehole = useBoreholeState();

  if (!borehole) {
    return <div>Loading Borehole Information...</div>;
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/projects")}
        className="mb-4 px-4 py-2 bg-slate-200 rounded hover:bg-slate-300"
        style={{ cursor: "pointer" }}
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold">Project Code: {projectCode}</h1>
      <h1 className="text-3xl font-bold">Borehole: {boreholeName}</h1>
      {/* Rest of your item details go here */}
    </div>
  );
}