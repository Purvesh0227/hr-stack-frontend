import { useOutletContext } from "react-router-dom";
import Finance from "../../components/Finance";

function FinancePage() {
    const { role } = useOutletContext();

    return <Finance role={role} />;
}

export default FinancePage;