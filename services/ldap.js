var ActiveDirectory = require('activedirectory');

async function initialize() {
    var adConfig = {};
    if ( process.env.LDAP_USETLS == 'Y' ) {
        adConfig['url'] = `ldaps://${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`;
        adConfig['secure'] = true;
        adConfig['bindDN'] = process.env.LDAP_PRINCIPAL;
        adConfig['bindCredentials'] = process.env.LDAP_CREDENTIAL;
    } else {
        adConfig['url'] = `ldap://${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`;
        adConfig['username'] = process.env.LDAP_PRINCIPAL;
        adConfig['password'] = process.env.LDAP_CREDENTIAL;
    }
    adConfig['baseDN'] = process.env.LDAP_BASE_DN;
    adConfig['userDN'] = process.env.LDAP_USER_DN;
    adConfig['groupDN'] = process.env.LDAP_GROUP_DN;

    process.adConfig = adConfig;
}

module.exports.initialize = initialize;
