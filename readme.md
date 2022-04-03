# DataServices API

## Introduction
This REST API example can connect to Oracle or Postgres.

## Settings
The configuration files are located in the config directory.  The config.env.example has some examples of settings.  Copy this file to /config/config.env and modify values for your environment.  The /config/database.js contains settings used to manage connection pool to the database.

## Authentication
A simple JWT based authentication has been built into the API.  The logic will need to be replaced with real authentication as the current is only comparing if the username is equal to the password.  The JWT settings in the configu.env should also be adjusted.  Last, the certificates will need to be generated and placed in the sslcert directory for TLS.

To login, perform a post to https://xxxxxx:nnnn/api/v1/auth/login passing in the Authorization header with 'Basic username:password'.

## Databases
The API is configured to connect to Oracle or Postgres.  More databases will come in the future.  The selected database is controlled by the environment variable (set externally or set in config.env) DATABASE_PLATFORM.  Set DATABASE_PLATFORM to either oracle or postgres.

## Tables
Tables are defined to the interface by a simple definition in the models directory.  Once a table is added (defined), update the /helpers/dbTables.js to include new tables.


## Endpoint Format
The endpoint follows the standard /api/v1/db/<ttttt>/<nnn>.  In the endpoint standard, ‘ttttt’ represents the name of the table.  Optionally a value for the primary key can be specified for the ‘nnn’ value to return a specific row or set of rows.

## Features
The end point supports features for filtering, sorting, and pagination and are appended as parameters to the endpoint.  The following table describes each of these features.  Multiple features can be specified and should be delimited by the ampersand (&).

### Example
Several examples exists in test/test-api.http which is designed to work with the Rest Client extension in vscode.

```
https://mydataservices.local/api/v1/employees?sort=LAST_NAME[desc]&JOB_ID[lk]=IT&offset=0&limit=10
```

### Sorting
sort=cccc[asc|desc]

The ‘cccc’ represents the column name that the sorting should be based on.  Note that for Oracle, these column names should be specified in upper case.  In brackets specify the order which the sorted output should appear (ascending or desceding).

### Filter
cccc[yy]=xxxx

The ‘cccc’ represents the column name.  Note that for Oracle, these column names should be specified in upper case.  The ‘xxxx’ represents the filtering value.

The ‘yy’ is the operator for the filter.  If left off, equal is assumed.  The following operators are available:
•	eq – Equal To
•	lt – Less Than
•	le – Less Than or Equal To
•	gt – Greater Than
•	ge – Greater Than or Equal To
•	ne – Not Equal
•	lk – Like (starts with)

### Pagination
offset=nn
limit=nn

Pagination is controlled by two parameters (offset and limit) where ‘nn’ resprents the number of rows for each argument.
