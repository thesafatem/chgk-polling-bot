/* eslint-disable prettier/prettier */
dbAdmin = db.getSiblingDB('admin');
dbAdmin.createUser({
	user: 'chgkPollingBot',
	pwd: 'password',
	roles: [{ role: 'userAdminAnyDatabase', db: 'admin'}],
	mechanisms: ['SCRAM-SHA-1'],
});