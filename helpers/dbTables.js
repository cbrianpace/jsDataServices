const employeeModel = require('../models/employeeModel')
const departmentModel = require('../models/departmentModel')
const employeesSalView = require('../models/employeeSalViewModel')

module.exports = {
    employees: employeeModel.employees,
    departments: departmentModel.departments,
    employee_sal_view: employeesSalView.employee_sal_view
}
