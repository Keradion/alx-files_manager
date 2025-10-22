# File Manager API

A backend API for user authentication, file and folder storage, access control, and background processing using email and image thumbnails.

---

## Technology Stack

- Node.js  
- Express  
- MongoDB  
- Redis  
- Bull (job queue)  
- Nodemailer (email service)  

---

## Features

- User registration with token-based authentication  
- Upload files, folders, and images  
- File listing, retrieval, and metadata  
- Public/private access controls  
- Serve file content (download/view)  
- Background processing:  
  - Send welcome email (via Nodemailer)  
  - Generate image thumbnails (100px, 250px, 500px)  

---

## Installation

```bash
git clone https://github.com/your-username/alx-files_manager.git
cd alx-files_manager
npm install
Environment Variables
Create a .env file with the following values:

env
Copy code
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
Running the Application
Start the API server:

bash
Copy code
npm start
Start the background worker:

bash
Copy code
node worker.js
API Endpoints & Examples
1. Check Server Status
bash
Copy code
curl http://localhost:5000/status
Response:

json
Copy code
{ "redis": true, "db": true }
2. Get Statistics
bash
Copy code
curl http://localhost:5000/stats
Response:

json
Copy code
{ "users": 4, "files": 30 }
3. Register User
bash
Copy code
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@dylan.com", "password":"toto1234!"}'
Response:

json
Copy code
{ "id": "<userId>", "email": "bob@dylan.com" }
Note: A welcome email is sent asynchronously in the background.

4. Login (Authenticate)
bash
Copy code
curl http://localhost:5000/connect \
  -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE="
Response:

json
Copy code
{ "token": "<uuid-token>" }
5. Get Current User
bash
Copy code
curl http://localhost:5000/users/me \
  -H "X-Token: <uuid-token>"
Response:

json
Copy code
{ "id": "<userId>", "email": "bob@dylan.com" }
6. Logout
bash
Copy code
curl -X GET http://localhost:5000/disconnect \
  -H "X-Token: <uuid-token>"
Response:
Status code: 204 No Content

7. Upload File
bash
Copy code
curl -X POST http://localhost:5000/files \
  -H "X-Token: <uuid-token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "hello.txt", "type": "file", "data": "SGVsbG8gV29ybGQ=" }'
Response:

json
Copy code
{
  "id": "<fileId>",
  "userId": "<userId>",
  "name": "hello.txt",
  "type": "file",
  "isPublic": false,
  "parentId": 0
}
8. Upload Folder
bash
Copy code
curl -X POST http://localhost:5000/files \
  -H "X-Token: <uuid-token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "photos", "type": "folder" }'
9. Get File Metadata
bash
Copy code
curl http://localhost:5000/files/<fileId> \
  -H "X-Token: <uuid-token>"
10. List Files (with optional pagination)
bash
Copy code
curl http://localhost:5000/files \
  -H "X-Token: <uuid-token>"
Optional with folder and page:

bash
Copy code
curl "http://localhost:5000/files?parentId=<folderId>&page=0" \
  -H "X-Token: <uuid-token>"
11. Publish a File
bash
Copy code
curl -X PUT http://localhost:5000/files/<fileId>/publish \
  -H "X-Token: <uuid-token>"
Response:

json
Copy code
{ "id": "<fileId>", "isPublic": true }
12. Unpublish a File
bash
Copy code
curl -X PUT http://localhost:5000/files/<fileId>/unpublish \
  -H "X-Token: <uuid-token>"
Response:

json
Copy code
{ "id": "<fileId>", "isPublic": false }
13. Download / View File Content
Public (no token needed):

bash
Copy code
curl http://localhost:5000/files/<fileId>/data
Private (token required):

bash
Copy code
curl http://localhost:5000/files/<fileId>/data \
  -H "X-Token: <uuid-token>"
Response: Raw file content (e.g., Hello Webstack!)

14. Download Image Thumbnails
Downloads the file as a resized image (if the file is an image):

bash
Copy code
curl "http://localhost:5000/files/<fileId>/data?size=100" -o thumbnail.png
Sizes supported: 100, 250, 500

Background Processing
User registration triggers a job to send a welcome email via Nodemailer.

Image uploads trigger thumbnail generation jobs (sizes 100px, 250px, 500px).

Jobs are handled asynchronously using Bull and Redis in worker.js.

Project Structure
pgsql
Copy code
.
├── controllers/
├── routes/
├── utils/
│   ├── redis.js
│   └── db.js
├── worker.js
├── server.js
└── README.md
Author
Project developed by Daniel Berihun as part of the ALX Software Engineering Program.

License
This project is provided for educational purposes only.
