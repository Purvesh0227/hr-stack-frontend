import { useOutletContext } from "react-router-dom";
import Attendance from "../../components/Attendance";

function AttendancePage() {
    const { role } = useOutletContext();

    return <Attendance role={role} />;
}

export default AttendancePage;