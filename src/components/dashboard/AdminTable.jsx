import { formatDate } from "../../utils/dateUtils";
import {formatPhoneNumber} from "../../utils/phoneFormatter";

// Rows only. Loading, empty state and pagination live in Admins.jsx
function AdminTable({ admins, dimmed = false }) {
    return (
        <div
            className="employee-table-wrapper"
            style={{
                opacity: dimmed ? 0.6 : 1,
                transition: "opacity .15s"
            }}
        >
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Joining Date</th>
                        <th>Role</th>
                    </tr>
                </thead>

                <tbody>
                    {admins.map((admin) => (
                        <tr key={admin.id}>
                            <td>{admin.empId}</td>

                            <td>
                                {admin.firstName} {admin.lastName}
                            </td>

                            <td>{admin.email}</td>

                            <td>{formatPhoneNumber(admin.mobile)}</td>

                            <td>{formatDate(admin.createdOn)}</td>

                            <td>{admin.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminTable;