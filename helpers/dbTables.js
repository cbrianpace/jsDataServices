const employeeModel = require('../models/employeeModel')
const departmentModel = require('../models/departmentModel')

module.exports = {
    employees: employeeModel.employees,
    departments: departmentModel.departments
}
