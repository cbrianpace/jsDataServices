function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("employees", {
    columns: [
        'EMPLOYEE_ID',
        'FIRST_NAME',
        'LAST_NAME',
        'EMAIL',
        'PHONE_NUMBER',
        'HIRE_DATE',
        'JOB_ID',
        'SALARY',
        'COMMISSION_PCT',
        'MANAGER_ID',
        'DEPARTMENT_ID',
    ],
    pk: 'EMPLOYEE_ID',
    dateColumns: ['HIRE_DATE'],
    multiColumnPK: false,
    encryptColumns: [],
    clobcolumn: [],
    sortableColumns: ['LAST_NAME','DEPARTMENT_ID'],
});
