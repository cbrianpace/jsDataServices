//
// employee_sal_view is on a database view that contains a function (salary_pct)
//
module.exports = {
    employee_sal_view: {
        columns: [
            'EMPLOYEE_ID',
            'FIRST_NAME',
            'LAST_NAME',
            'SALARY',
            'SALARY_PCT',
        ],
        pk: 'EMPLOYEE_ID',
        dateColumns: [],
        multiColumnPK: false,
        encryptColumns: [],
        clobcolumn: [],
        sortableColumns: ['LAST_NAME','SALARY_PCT']
    },
};