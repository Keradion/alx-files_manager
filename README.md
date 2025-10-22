File Manager API

A backend API for user authentication, file and folder storage, access control (public/private), and background processing. Built using Node.js, Express, MongoDB, Redis, Bull, and Nodemailer.

Technology Stack

Node.js

Express

MongoDB

Redis

Bull (job queue)

Nodemailer (email transport)

JavaScript (ES6+)

Features

User registration and token‑based authentication

Upload of files, folders and images

Listing and retrieval of files (with folder hierarchy)

Publish/unpublish control of files

Serving of file content (download/view)

Background worker for sending a welcome email via Nodemailer upon user registration

Background worker for generating image thumbnails (100px, 250px, 500px)

Installation and Setup
git clone https://github.com/your‑username/alx-files_manager.git
cd alx-files_manager
npm install


Create a .env file (or set environment variables) with the following values:

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

npm start


Start the background worker (for email and thumbnails):

node worker.js

API Endpoints — curl Examples
1. Status Check
curl http://localhost:5000/status


Response:

{ "redis": true, "db": true }

2. Stats
curl http://localhost:5000/stats


Response:

{ "users": 4, "files": 30 }

3. Register User
curl -X POST http://localhost:5000/users \
‑H "Content‑Type: application/json" \
‑d '{"email":"bob@dylan.com","password":"toto1234!"}'


Response:

{ "id":"<userId>", "email":"bob@dylan.com" }


Note: After registration, a job is queued and a welcome email is sent to the user in the background.

4. Authenticate (Login)
curl http://localhost:5000/connect \
‑H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE="


Response:

{ "token":"<uuid-token>" }

5. Get Current User
curl http://localhost:5000/users/me \
‑H "X‑Token:<uuid-token>"


Response:

{ "id":"<userId>", "email":"bob@dylan.com" }

6. Logout
curl ‑X GET http://localhost:5000/disconnect \
‑H "X‑Token:<uuid-token>"


Response:
Status code: 204 No Content

7. Upload a File
curl ‑X POST http://localhost:5000/files \
‑H "X‑Token:<uuid-token>" \
‑H "Content‑Type: application/json" \
‑d '{ "name": "hello.txt", "type": "file", "data": "SGVsbG8gV29ybGQ=" }'


Response:

{ "id":"<fileId>", "userId":"<userId>", "name":"hello.txt", "type":"file", "isPublic":false, "parentId":0 }

8. Upload a Folder
curl ‑X POST http://localhost:5000/files \
‑H "X‑Token:<uuid-token>" \
‑H "Content‑Type: application/json" \
‑d '{ "name":"photos", "type":"folder" }'

9. Get File Metadata
curl http://localhost:5000/files/<fileId> \
‑H "X‑Token:<uuid-token>"


Response:

{ "id":"<fileId>", "userId":"<userId>", "name":"hello.txt", "type":"file", "isPublic":false, "parentId":0 }

10. List Files (with optional folder and pagination)
curl http://localhost:5000/files \
‑H "X‑Token:<uuid-token>"


Optional:

curl "http://localhost:5000/files?parentId=<folderId>&page=0" \
‑H "X‑Token:<uuid-token>"


Response:

[
  { "id":"...", "name":"hello.txt", "type":"file", … }
]

11. Publish a File
curl ‑X PUT http://localhost:5000/files/<fileId>/publish \
‑H "X‑Token:<uuid-token>"


Response:

{ "id":"<fileId>", "isPublic":true, … }

12. Unpublish a File
curl ‑X PUT http://localhost:5000/files/<fileId>/unpublish \
‑H "X‑Token:<uuid-token>"


Response:

{ "id":"<fileId>", "isPublic":false, … }

13. Download / View File Content
Public file (no auth required):
curl http://localhost:5000/files/<fileId>/data

Private file (authentication required):
curl http://localhost:5000/files/<fileId>/data \
‑H "X‑Token:<uuid-token>"


Response:
Raw file content (for example, text: Hello Webstack!)

14. Image Thumbnail Download (for type=image)

Download sizes: 100, 250, 500

curl "http://localhost:5000/files/<fileId>/data?size=100" ‑so thumbnail.png

Implementation Notes

When a new user registers, the code enqueues a job for sending a welcome email to the user.

The job is processed by a worker using Bull/Redis.

Nodemailer is configured via SMTP transport to send the email asynchronously, avoiding blocking the request‑response cycle.

Code follows best practices such as ObjectId validation, secure token handling, and separation of concerns (controller, utils, worker).

Directory Structure
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

