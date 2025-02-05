# API and JWT Testing with Postman

This guide will walk you through how to test the API endpoints using Postman. The API includes user registration, login, and protected routes for retrieving, updating, and deleting users. JWT (JSON Web Token) is used for authentication in the protected routes.

## Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine.
- The API server running locally at `http://localhost:5000`.

## Endpoints

### 1. Register a User

**Method:** `POST`  
**URL:** `http://localhost:5000/register`  
**Body (JSON):**

json
{
"name": "belachew kebede",
"email": "belachew@example.com",
"password": "securePass123"
}

### 2. Login and Get a Token

Method: POST
URL: http://localhost:5000/login
Body (JSON):
{
"email": "belachew@example.com",
"password": "securePass123"
}
Response:
{
"token": "your-jwt-token-here"
}

### 3. Retrieve Users (Protected Route)

Method: GET
URL: http://localhost:5000/users
Headers:
Authorization: Bearer your-jwt-token-here

###

4. Update a User (Protected Route)
   Method: PUT
   URL: http://localhost:5000/users/1
   Headers:
   Authorization: Bearer your-jwt-token-here

Body (JSON):
{
"name": "Updated rooney",
"email": "rooney@example.com"
}

Response
{
"message": "User with ID 1 updated successfully."
}

5. Delete a User (Protected Route)
   Method: DELETE
   URL: http://localhost:5000/users/1
   Headers:
   Authorization: Bearer your-jwt-token-here

Response:
{
"message": "User with ID 1 deleted successfully."
}

Steps to Test
Register a User: Use the /register endpoint to create a new user.

Login and Get a Token: Use the /login endpoint to authenticate and obtain a JWT token.

Retrieve Users: Use the /users endpoint with the JWT token in the headers to retrieve a list of users.

Update a User: Use the /users/{id} endpoint with the JWT token to update a user's details.

Delete a User: Use the /users/{id} endpoint with the JWT token to delete a user.

```

```
