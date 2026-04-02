# HomeFunds

> Full-stack expense tracking app built with React, Node.js, and MongoDB, featuring receipt uploads and persistent data storage.

HomeFunds is a full-stack personal finance web application designed to help families track shared expenses, manage spending, and maintain transparency across multiple users. The application allows users to log expenses, categorize spending, and attach receipts for better financial visibility.

## Features

- User signup and login (persisted with localStorage)
- Add, view, and delete expenses
- Categorize expenses (Needs vs Wants)
- Track spending by family member
- Upload and view receipt files (images and PDFs)
- Persistent data storage using MongoDB
- RESTful API for expense management (GET, POST, DELETE)

## Tech Stack

**Frontend**
- React
- JavaScript (ES6+)
- CSS

**Backend**
- Node.js
- Express
- REST API design

**Database**
- MongoDB (Mongoose)

**File Handling**
- Multer (local file uploads)

## Structure

- `/client` → React frontend  
- `/server` → Express API + MongoDB  

## API Endpoints

### Expenses
- `GET /api/expenses` → fetch all expenses  
- `POST /api/expenses` → create new expense (supports file upload)  
- `DELETE /api/expenses/:id` → delete expense  

## Future Improvements

- Cloud storage for receipts (AWS S3)
- Authentication with secure backend sessions/JWT
- Improved UI/UX and dashboard analytics
- Budget tracking and alerts
- Mobile responsiveness

## Notes

- Uploaded receipt files are stored locally in `/server/uploads` and are not tracked in Git.
- This project is intended as a full-stack learning and portfolio project.

## Author

Jack Pfeifer