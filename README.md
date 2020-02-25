# Task Manager API
This is a REST API built using Node.js and MongoDB. It allows users to manage ToDo lists.

## Endpoints
`BASE_URL = https://cimmanuel-taskmanager.herokuapp.com`
- POST /users (create user)
- POST /users/login (login user)
- POST /users/logout (logout user)
- POST /users/logoutAll (all sessions)
- GET /users/profile (view user profile)
- PATCH /users/profile (update user profile)
- DELETE /users/profile (delete user profile)
- POST /tasks (create task)
- GET /tasks (view all tasks)
- GET /tasks/:id (view a particular task)
- PATCH /tasks/:id (update a task)
- DELETE /tasks/:id (delete a task)
- POST /users/profile/avatar (upload avatar)
- GET /users/:id/avatar (view avatar)
- DELETE /users/profile/avatar (delete avatar)

## Usage

### POST /users (create user)
#### Parameters
| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| name | string | **Required.** The name of the user. |
| email | string | **Required.** The email of the user. |
| password | string | **Required.** Password of choice. Musn't contain the word 'password'. |
| age | integer | Optional. The age of the user. Defaults to 0. |

#### Body (application/json)
```json
{
    "name": "Tomfoolery Simpleton",
    "email": "tomfoolerysimpleton@gmail.com",
    "password": "SomeStrongString",
    "age": 23
}
```

#### Response
**Status: 201 Created**
```json
{
    "user": {
        "age": 23,
        "_id": "5e552f78cdfb0d146b627467",
        "name": "Tomfoolery Simpleton",
        "email": "tomfoolerysimpleton@gmail.com",
        "createdAt": "2020-02-25T14:30:16.761Z",
        "updatedAt": "2020-02-25T14:30:17.170Z",
        "__v": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTU1MmY3OGNkZmIwZDE0NmI2Mjc0NjciLCJpYXQiOjE1ODI2NDEwMTd9.7WdG1bXFnN37H6fxUTWHpJSIht6RL4UKrOfaxxp6174"
}
```