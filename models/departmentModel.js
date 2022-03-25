module.exporters = {
    departments:
    {
        columns: [
            'DEPARTMENT_ID',
            'DEPARTMENT_NAME',
            'MANAGER_ID',
            'LOCALTION_ID',
        ],
        pk: 'DEPARTMENT_ID',
        dateColumns: [],
        multiColumnPK: false,
        encryptColumns: [],
        clobcolumn: [],
        sortableColumns: ['DEPARTMENT_ID','DEPARTMENT_NAME'],
    }
}
