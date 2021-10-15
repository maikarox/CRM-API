# CRM-API

Basic API to manage customers data and users.

## Getting started

### Set the environment variables

```
$ cp env.example .env
```

The env vars required are the following:

- NODE_ENV: node environment `dev` or `production`.
- PORT: Server port.
- DB_USER: MongoDB user.
- DB_PASSWORD: MongoDB password.
- MONGODB_DATABASE: Database name.
- MONGODB_PORT: DB port.
- MONGODB_URI: The DB connection string. The host should be localhost or mongodb when running docker node server.
- SECRET: This is the private key or secret used to generate and sign the authentication token. 

### Start the DB and the server

This project provides a docker-compose file to run the MongoDB in Docker and a script to start the dev server.

To start the DB and server run:

```
./scripts/local-server -s
```

The `-s` argument is passed to the script to seed tha database with the roles, users and customers.

You can test the endpoint with the users:
- admin@example.com: with role Admin.
- user1@example.com: with role User.

with the password Pass-Test

### Test the endpoints

1. Login as an existing user to `get the access token`:
 ```
 POST /api/login
 ```

 This request will return an access token for the user and the `expiresIn` date.

2. Include the token in the Authorization header as a Bearer token.

### Roles

The existing user roles are `User` and `Admin`.

- The role `User` has the following permissions:

   - `read:all_customers`: Get customers.

   - `create:all_customers`: Create customers.

   - `update:all_customers`: Update and soft-delete customers.

- The role `Admin` has all User permissions and the following:

   - `delete:all_customers`: Hard delete customers.
   - `read:all_users`: Read users.
   - `create:all_users`: Create users.
   - `update:all_users`: Update and soft-delete.
   - `update:all_admins`: Change admin status.
   - `delete:all_users`: Hard delete users.

### Existing routes

**Auth**

- `POST /api/login`: 

   - Receives the credentials and return the access tokem.

**Users**

- `GET /api/users`: 
   
   - Rule protected by `Admin` role and `read:all_users` permission.

- `POST /api/users`: 
   
   - Rule protected by `Admin` role and `create:all_users` permission.

- `PATCH /api/users/:userId`: 
   
   - Rule protected by `Admin` role and `update:all_users` permission.

- `PATCH /api/users/:userId/disable`: 

   - Soft-delete a user.   
   - Rule protected by `Admin` role and `update:all_users` permission.

- `PATCH /api/users/:userId/grant/admin`: 

   - Route to grant Admin role to a user.
   - Rule protected by `Admin` role and `update:all_admins` permission.

- `PATCH /api/users/:userId/revoke/admin`: 
   
   - Route to remove Admin role from a user.
   - Rule protected by `Admin` role and `update:all_admins` permission.

- `DELETE /api/users/:userId`: 
   
   - Hard delete a user.
   - Rule protected by `Admin` role and `delete:all_users` permission.

**Customers**

- `GET /api/customers`: 
   
   - Rule protected by `User` role and `read:all_customers` permission.

- `POST /api/customers`: 
   
   - Rule protected by `User` role and `create:all_customers` permission.

- `PATCH /api/customers/:customerId`: 
   
   - Rule protected by `User` role and `update:all_customers` permission.

- `PATCH /api/customers/:customerId/disable`: 

   - Soft-delete a customer.   
   - Rule protected by `User` role and `update:all_customers` permission.

- `DELETE /api/customers/:customerId`: 

   - Hard elete a customer.   
   - Rule protected by `Admin` role and `delete:all_customers` permission.
