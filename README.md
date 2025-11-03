# File Manager API

A backend API for user authentication, file and folder storage, access control (public/private), and background processing. Built using Node.js, Express, MongoDB, Redis, Bull, and Nodemailer.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express.js-Backend-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Redis](https://img.shields.io/badge/Cache-Redis-red)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## Technology Stack

* Node.js
* Express
* MongoDB
* Redis
* Bull (job queue)
* Nodemailer (email transport)
* JavaScript (ES6+)

---

## Features

* User registration and token-based authentication
* Upload of files, folders, and images
* Listing and retrieval of files with folder hierarchy
* Publish/unpublish control of files
* Serving file content (download/view)
* Background worker sending welcome emails via Nodemailer upon registration
* Background worker generating image thumbnails (100px, 250px, 500px)

---

## Installation and Setup

```bash
git clone https://github.com/your-username/alx-files_manager.git
cd alx-files_manager
npm install
```

Create a `.env` file with the following values:

```
PORT=5000
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=files_manager
REDIS_HOST=localhost
REDIS_PORT=6379
FOLDER_PATH=/tmp/files_manager
SMTP_HOST=<your_smtp_host>
SMTP_PORT=<smtp_port>
SMTP_USER=<smtp_user>
SMTP_PASS=<smtp_pass>
```

---

## Running the Application

Start the API server:

```bash
npm start
```

Start the background worker for emails and thumbnails:

```bash
node worker.js
```

---

## API Endpoints & Examples

### 1. Check Server Status

```bash
curl http://localhost:5000/status
```

Response:

```json
{ "redis": true, "db": true }
```

---

### 2. Get Statistics

```bash
curl http://localhost:5000/stats
```

Response:

```json
{ "users": 4, "files": 30 }
```

---

### 3. Register User

```bash
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@dylan.com", "password":"toto1234!"}'
```

Response:

```json
{ "id": "<userId>", "email": "bob@dylan.com" }
```

*Note: A welcome email is sent asynchronously in the background.*

---

### 4. Login (Authenticate)

```bash
curl http://localhost:5000/connect \
  -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE="
```

Response:

```json
{ "token": "<uuid-token>" }
```

---

### 5. Get Current User

```bash
curl http://localhost:5000/users/me \
  -H "X-Token: <uuid-token>"
```

Response:

```json
{ "id": "<userId>", "email": "bob@dylan.com" }
```

---

### 6. Logout

```bash
curl -X GET http://localhost:5000/disconnect \
  -H "X-Token: <uuid-token>"
```

Response: Status code 204 No Content

---

### 7. Upload File

```bash
curl -X POST http://localhost:5000/files \
  -H "X-Token: <uuid-token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "hello.txt", "type": "file", "data": "SGVsbG8gV29ybGQ=" }'
```

Response:

```json
{
  "id": "<fileId>",
  "userId": "<userId>",
  "name": "hello.txt",
  "type": "file",
  "isPublic": false,
  "parentId": 0
}
```

---

### 8. Upload Folder

```bash
curl -X POST http://localhost:5000/files \
  -H "X-Token: <uuid-token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "photos", "type": "folder" }'
```

---

### 9. Get File Metadata

```bash
curl http://localhost:5000/files/<fileId> \
  -H "X-Token: <uuid-token>"
```

---

### 10. List Files (with optional pagination)

```bash
curl http://localhost:5000/files \
  -H "X-Token: <uuid-token>"
```

Optional with folder and page:

```bash
curl "http://localhost:5000/files?parentId=<folderId>&page=0" \
  -H "X-Token: <uuid-token>"
```

---

### 11. Publish a File

```bash
curl -X PUT http://localhost:5000/files/<fileId>/publish \
  -H "X-Token: <uuid-token>"
```

Response:

```json
{ "id": "<fileId>", "isPublic": true }
```

---

### 12. Unpublish a File

```bash
curl -X PUT http://localhost:5000/files/<fileId>/unpublish \
  -H "X-Token: <uuid-token>"
```

Response:

```json
{ "id": "<fileId>", "isPublic": false }
```

---

### 13. Download / View File Content

Public (no token needed):

```bash
curl http://localhost:5000/files/<fileId>/data
```

Private (token required):

```bash
curl http://localhost:5000/files/<fileId>/data \
  -H "X-Token: <uuid-token>"
```

*Response: Raw file content (e.g., Hello Webstack!)*

---

### 14. Download Image Thumbnails

Download file as resized image (for images):

```bash
curl "http://localhost:5000/files/<fileId>/data?size=100" -o thumbnail.png
```

*Supported sizes:* 100, 250, 500

---

## Background Processing

* User registration triggers a job to send a welcome email via Nodemailer.
* Image uploads trigger thumbnail generation jobs (sizes 100px, 250px, 500px).
* Jobs are handled asynchronously using Bull and Redis in `worker.js`.

---

## Project Structure

```
.
├── controllers/
│   ├── AppController.js        # Handles /status and /stats endpoints  
│   ├── AuthController.js       # Authentication logic  
│   ├── FilesController.js      # File/folder operations, publish/unpublish  
│   └── UsersController.js      # User registration and profile  
├── routes/
│   └── index.js               # API routes  
├── utils/
│   ├── db.js                  # MongoDB helpers  
│   ├── redis.js               # Redis helpers  
│   ├── decodeAuth.js          # Basic auth decoder  
│   ├── token.js               # Token helpers  
│   ├── validation.js          # Input validation  
│   └── password.js            # Password hashing/validation  
├── worker.js                  # Background job processor  
├── package.json               # Dependencies and scripts  
├── server.js                  # Express app startup  
├── .env                       # Environment variables  
└── README.md                  # Documentation  
```

---

## Author

Project developed by Daniel Berihun as part of the ALX Software Engineering Program.

---
