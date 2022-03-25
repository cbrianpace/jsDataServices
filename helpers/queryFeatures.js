const queryFeatures = require('../helpers/queryFeatures');
const excludedFields = ['offset', 'sort', 'limit', 'fields'];
var objectConstructor = {}.constructor;
var context = {};

exports.filter = (req, sqlObject, query, binds, bindCount) => {
    context.id = parseInt(req.params.id, 10);
    context.offset = parseInt(req.query.offset, 10);
    context.limit = parseInt(req.query.limit, 10);
    context.fields = req.query.fields;
    context.sort = req.query.sort;

    // Filtering
    if (parseInt(req.params.id, 10)) {
        query += ` and ${sqlObject.pk} = :id`;
        binds.id = parseInt(req.params.id, 10);
    }

    return [query, binds, bindCount];
};

exports.advancedFilter = (req, sqlObject, query, binds, bindCount) => {
    context.id = parseInt(req.params.id, 10);
    context.offset = parseInt(req.query.offset, 10);
    context.limit = parseInt(req.query.limit, 10);
    context.fields = req.query.fields;
    context.sort = req.query.sort;

    // Advanced Filtering
    var queryObj = {
        ...req.query,
    };
    excludedFields.forEach((el) => delete queryObj[el]);

    for (var key in queryObj) {
        if (queryObj[key].constructor === Array) {
            query +=
                ` and ${key} in (` +
                JSON.stringify(queryObj[key])
                    .replace('[', '')
                    .replace(']', '')
                    .replace(/\"/g, "'") +
                `) `;
        } else if (queryObj[key].constructor === objectConstructor) {
            for (var key2 in queryObj[key]) {
                if (
                    queryObj[key][key2].constructor === Array &&
                    key2 === 'ne'
                ) {
                    query +=
                        ` and ${key} not in (` +
                        JSON.stringify(queryObj[key][key2])
                            .replace('[', '')
                            .replace(']', '')
                            .replace(/\"/g, "'") +
                        `) `;
                } else {
                    query += ` and ${key} `;
                    switch (key2) {
                        case 'lt':
                            query += ' < ';
                            break;
                        case 'le':
                            query += ' <= ';
                            break;
                        case 'gt':
                            query += ' > ';
                            break;
                        case 'gte':
                            query += ' >= ';
                            break;
                        case 'ne':
                            query += ' != ';
                            break;
                        case 'lk':
                            query += ' like ';
                            break;
                        default:
                            query += ' = ';
                    }

                    if (
                        sqlObject.dateColumns &&
                        sqlObject.dateColumns.includes(key)
                    ) {
                        query += ` cast(to_utc_timestamp_tz(:b${bindCount}) at time zone dbtimezone as date) `;
                    } else {
                        query += ` :b${bindCount} `;
                    }

                    if (key2 === 'lk') {
                        binds[`b${bindCount}`] = queryObj[key][key2] + '%';
                    } else {
                        binds[`b${bindCount}`] = queryObj[key][key2];
                    }
                    bindCount++;
                }
            }
        } else {
            query += ` and ${key} = :b${bindCount} `;
            binds[`b${bindCount}`] = queryObj[key];
            bindCount++;
        }
    }

    return [query, binds, bindCount];
};

exports.sorting = (req, sqlObject, query, binds, bindCount) => {
    context.id = parseInt(req.params.id, 10);
    context.offset = parseInt(req.query.offset, 10);
    context.limit = parseInt(req.query.limit, 10);
    context.fields = req.query.fields;
    context.sort = req.query.sort;

    // Sorting
    if (context.sort) {
        let [column, order] = context.sort.split('[');
        order = order.replace(']','')
        if (sqlObject.sortableColumns) {
            if (!sqlObject.sortableColumns.includes(column)) {
                throw new Error('Invalid sort column');
            }
        } else {
            if (!sqlObject.columns.includes(column)) {
                throw new Error('Invalid sort column');
            }
        }
        if (order === undefined) {
            order = 'asc';
        }
        if (order !== 'asc' && order !== 'desc') {
            throw new Error('Invalid sort order');
        }
        query += `\n order by ${column} ${order}`;
    } else {
        if (sqlObject.defaultSort) {
            query += `\n ${sqlObject.defaultSort}`;
        }
    }

    return [query, binds, bindCount];
};

exports.pagination = (req, sqlObject, query, binds, bindCount) => {
    context.id = parseInt(req.params.id, 10);
    context.offset = parseInt(req.query.offset, 10);
    context.limit = parseInt(req.query.limit, 10);
    context.fields = req.query.fields;
    context.sort = req.query.sort;

    // Pagination
    if (context.offset) {
        binds.row_offset = context.offset;
        query += '\n offset :row_offset rows';
    }
    const limit = context.limit > 0 ? context.limit : 100;
    binds.row_limit = limit;
    query += '\n fetch next :row_limit rows only';

    return [query, binds, bindCount];
};
