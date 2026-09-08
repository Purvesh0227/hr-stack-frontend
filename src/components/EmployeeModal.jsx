import { isValidPhone } from "../utils/validators";

function EmployeeModal({
    isOpen,
    employee,
    mode,
    onClose,
    onSave
}) {

    if (!isOpen || !employee) {
        return null;
    }

    const isEdit = mode === "edit";

    const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const mobile = formData.get("mobile");

    if (!isValidPhone(mobile)) {
        alert("Mobile number must contain exactly 10 digits.");
        return;
    }

    const updatedEmployee = {
        ...employee,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        mobile: mobile
    };

    onSave(updatedEmployee);
};

    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">
                    <h2>
                        {isEdit
                            ? "Edit Employee"
                            : "Employee Details"}
                    </h2>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Employee ID</label>
                        <input
                            type="text"
                            value={employee.empId || ""}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            defaultValue={employee.firstName || ""}
                            readOnly={!isEdit}
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            defaultValue={employee.lastName || ""}
                            readOnly={!isEdit}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={employee.email || ""}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile</label>
                        <input
                            type="text"
                            name="mobile"
                            defaultValue={employee.mobile || ""}
                            readOnly={!isEdit}
                            maxLength={10}
                            inputMode="numeric"
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <input
                            type="text"
                            value={employee.role || ""}
                            readOnly
                        />
                    </div>

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={onClose}
                        >
                            Close
                        </button>

                        {isEdit && (
                            <button
                                type="submit"
                                className="primary-btn"
                            >
                                Save Changes
                            </button>
                        )}

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EmployeeModal;