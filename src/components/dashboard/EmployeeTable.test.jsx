import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import EmployeeTable from "./EmployeeTable";

function makeProps(overrides = {}) {
    return {
        employees: [],
        employeeTotalElements: 0,
        loadingEmployees: false,

        employeeSearchTerm: "",
        setEmployeeSearchTerm: vi.fn(),
        employeeStatusFilter: "",
        setEmployeeStatusFilter: vi.fn(),
        employeeFromDate: "",
        setEmployeeFromDate: vi.fn(),
        employeeToDate: "",
        setEmployeeToDate: vi.fn(),
        hasEmployeeFilters: false,
        handleClearEmployeeFilters: vi.fn(),

        employeeCurrentPage: 1,
        employeeTotalPages: 1,
        setEmployeeCurrentPage: vi.fn(),
        employeePageSize: 10,
        setEmployeePageSize: vi.fn(),

        handleViewEmployee: vi.fn(),
        handleEditEmployee: vi.fn(),
        toDisplayText: (s) => s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        ...overrides
    };
}

const sampleEmployee = {
    id: "e1",
    empId: "HRStack_2025_IT_001",
    firstName: "test",
    lastName: "Test",
    email: "user@example.com",
    mobile: "9999999999",
    role: "EMPLOYEE",
    status: "ACTIVE",
    createdOn: 1735689600000
};

describe("EmployeeTable", () => {
    it("renders employee rows", () => {
        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [sampleEmployee],
                    employeeTotalElements: 1
                })}
            />
        );

        expect(
            screen.getByRole("button", { name: /hrstack_2025_it_001/i })
        ).toBeInTheDocument();
        expect(screen.getByText("test Test")).toBeInTheDocument();
        expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });

    it("shows loader on first load", () => {
        renderWithProviders(
            <EmployeeTable
                {...makeProps({ employees: [], loadingEmployees: true })}
            />
        );

        expect(document.querySelector(".loader")).toBeTruthy();
    });

    it("shows 'No employees available' when empty and no filters", () => {
        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [],
                    hasEmployeeFilters: false,
                    loadingEmployees: false
                })}
            />
        );

        expect(screen.getByText(/no employees available/i)).toBeInTheDocument();
    });

    it("shows 'No employees match the selected filters' when empty and filtered", () => {
        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [],
                    hasEmployeeFilters: true,
                    loadingEmployees: false
                })}
            />
        );

        expect(
            screen.getByText(/no employees match the selected filters/i)
        ).toBeInTheDocument();
    });

    it("calls setEmployeeSearchTerm when typing in the search box", async () => {
        const setSearch = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [sampleEmployee],
                    employeeTotalElements: 1,
                    setEmployeeSearchTerm: setSearch
                })}
            />
        );

        const input = screen.getByLabelText("Search");
        await user.type(input, "pur");

        expect(setSearch).toHaveBeenCalled();
    });

    it("calls handleViewEmployee when View is clicked", async () => {
        const onView = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [sampleEmployee],
                    employeeTotalElements: 1,
                    handleViewEmployee: onView
                })}
            />
        );

        await user.click(
            screen.getByRole("button", { name: /view employee/i })
        );

        expect(onView).toHaveBeenCalledWith(sampleEmployee);
    });

    it("calls handleEditEmployee when Edit is clicked", async () => {
        const onEdit = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [sampleEmployee],
                    employeeTotalElements: 1,
                    handleEditEmployee: onEdit
                })}
            />
        );

        await user.click(
            screen.getByRole("button", { name: /edit employee/i })
        );

        expect(onEdit).toHaveBeenCalledWith(sampleEmployee);
    });

    it("calls setEmployeePageSize when the rows-per-page select changes", async () => {
        const setSize = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [sampleEmployee],
                    employeeTotalElements: 1,
                    setEmployeePageSize: setSize
                })}
            />
        );

        await user.selectOptions(
            screen.getByLabelText(/rows per page/i),
            "25"
        );

        expect(setSize).toHaveBeenCalledWith(25);
    });

    it("calls setEmployeeCurrentPage when Next is clicked", async () => {
        const setPage = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <EmployeeTable
                {...makeProps({
                    employees: [sampleEmployee],
                    employeeTotalElements: 20,
                    employeeTotalPages: 2,
                    employeeCurrentPage: 1,
                    setEmployeeCurrentPage: setPage
                })}
            />
        );

        await user.click(screen.getByRole("button", { name: /next/i }));

        expect(setPage).toHaveBeenCalledWith(2);
    });
});