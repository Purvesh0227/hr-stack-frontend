import { formatDate } from "../../utils/dateUtils";

function AdminTable({ admins, loadingAdmins }) {
    if (loadingAdmins) {
        return null;
    }

    if (admins.length === 0) {
        return null;
    }

    return (
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

                        <td>{admin.mobile}</td>

                        <td>{formatDate(admin.createdOn)}</td>

                        <td>{admin.role}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default AdminTable;