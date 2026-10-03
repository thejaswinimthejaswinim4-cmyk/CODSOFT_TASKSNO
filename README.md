# Student Record Management API

A robust, modular RESTful API built with **Node.js**, **Express.js**, **Sequelize ORM**, and **SQLite**. Designed for managing academic records—including students, courses, and course enrollments—with data validation, relational integrity, search, filtering, sorting, and pagination.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Folder Structure](#folder-structure)
4. [Database Structure & Relationships](#database-structure--relationships)
5. [Installation & Setup](#installation--setup)
6. [Running the Application](#running-the-application)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Query Parameters (Search, Filter, Sort, Paginate)](#query-parameters)
9. [Example API Requests & Responses](#example-api-requests--responses)
10. [Error Handling & Status Codes](#error-handling--status-codes)
11. [Testing](#testing)

---

## Project Overview

The **Student Record Management API** provides full CRUD (Create, Read, Update, Delete) functionality for students, courses, and enrollments. It enforces strict relational integrity between entities, validates all incoming payloads and query parameters using **Joi**, and returns structured JSON responses.

### Key Features
- **Full CRUD Operations**: Complete management of Students, Courses, and Enrollments.
- **Relational Integrity**: 
  - One student has many enrollments.
  - One course has many enrollments.
  - Each enrollment belongs to one student and one course.
  - Composite unique constraint prevents duplicate enrollments for the same student and course.
- **Query Capabilities**:
  - **Search**: Case-insensitive substring search across multiple attributes.
  - **Filtering**: Multi-field exact filters (e.g., status, gender, department, credits).
  - **Sorting**: Flexible sorting on multiple allowed columns in `ASC` or `DESC` order.
  - **Pagination**: Offset-based pagination with metadata (`totalItems`, `totalPages`, `currentPage`, `hasNextPage`, `hasPrevPage`).
- **Input Validation**: Joi middleware validates route parameters (`:id`), request bodies, and query strings.
- **Centralized Error Handling**: Standardized error responses for Joi validations, Sequelize unique constraints (409), foreign key errors, 404s, and unexpected errors.
- **Security & Utilities**: CORS support, environment configuration with `dotenv`, and HTTP request logging via `morgan`.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | JavaScript runtime environment |
| **Express.js** (v5) | Web framework for routing and middleware |
| **SQLite3** | Lightweight relational database engine |
| **Sequelize** (v6) | Promise-based ORM for model definitions, migrations, and queries |
| **Joi** (v18) | Schema-based payload and query parameter validation |
| **dotenv** | Environment variable management |
| **cors** | Cross-Origin Resource Sharing middleware |
| **morgan** | HTTP request logger |
| **nodemon** | Development server live reload |

---

## Folder Structure

```
CODSOFT_TASKSNO/
├── config/
│   └── database.js             # SQLite connection & Sequelize initialization
├── controllers/
│   ├── studentController.js    # Student business logic & queries
│   ├── courseController.js     # Course business logic & queries
│   └── enrollmentController.js # Enrollment business logic & queries
├── middleware/
│   ├── asyncHandler.js         # Wrapper for handling async route exceptions
│   ├── errorHandler.js         # Centralized error handler & custom AppError
│   ├── notFound.js             # 404 handler for unmatched routes
│   └── validate.js             # Generic Joi request validation middleware
├── models/
│   ├── index.js                # Model association definitions & exports
│   ├── Student.js              # Student Sequelize model
│   ├── Course.js               # Course Sequelize model
│   └── Enrollment.js           # Enrollment Sequelize model
├── routes/
│   ├── index.js                # Aggregate router & health check endpoint
│   ├── studentRoutes.js        # Student route definitions & validators
│   ├── courseRoutes.js         # Course route definitions & validators
│   └── enrollmentRoutes.js     # Enrollment route definitions & validators
├── validators/
│   ├── studentValidator.js     # Joi validation schemas for students
│   ├── courseValidator.js      # Joi validation schemas for courses
│   └── enrollmentValidator.js  # Joi validation schemas for enrollments
├── .env                        # Local environment variables (git-ignored)
├── .env.example                # Example environment template
├── .gitignore                  # Git ignore file (excludes node_modules, .env, *.sqlite)
├── database.sqlite             # SQLite database file (generated automatically)
├── package.json                # Project dependencies and npm scripts
├── README.md                   # Project documentation
├── seed.js                     # Database seeding script with realistic sample records
└── test-api.js                 # Automated API test suite covering all requirements
```

---

## Database Structure & Relationships

### Entity-Relationship (ER) Overview
```
+---------------+           +------------------+           +---------------+
|    Student    | 1       * |    Enrollment    | *       1 |    Course     |
+---------------+-----------+------------------+-----------+---------------+
| id (PK)       |           | id (PK)          |           | id (PK)       |
| firstName     |           | studentId (FK)   |           | courseCode    |
| lastName      |           | courseId (FK)    |           | title         |
| email (Unique)|           | enrollmentDate   |           | description   |
| phone         |           | grade            |           | credits       |
| dateOfBirth   |           | status           |           | department    |
| gender        |           | createdAt        |           | status        |
| status        |           | updatedAt        |           | createdAt     |
| createdAt     |           +------------------+           | updatedAt     |
| updatedAt     |                                          +---------------+
+---------------+
```

### Table Definitions

#### 1. `students` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique student identifier |
| `firstName` | VARCHAR(50) | NOT NULL | Student's first name |
| `lastName` | VARCHAR(50) | NOT NULL | Student's last name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE, VALID_EMAIL | Student's email address |
| `phone` | VARCHAR(20) | NULLABLE | Phone number |
| `dateOfBirth` | DATEONLY | NULLABLE | Date of birth (YYYY-MM-DD) |
| `gender` | VARCHAR(20) | DEFAULT 'Other' | 'Male', 'Female', or 'Other' |
| `status` | VARCHAR(20) | DEFAULT 'Active' | 'Active', 'Inactive', 'Graduated', 'Suspended' |
| `createdAt` | DATETIME | NOT NULL | Timestamp of record creation |
| `updatedAt` | DATETIME | NOT NULL | Timestamp of record last update |

#### 2. `courses` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique course identifier |
| `courseCode` | VARCHAR(20) | NOT NULL, UNIQUE | Course code (e.g. `CS101`) |
| `title` | VARCHAR(100) | NOT NULL | Full course name |
| `description` | TEXT | NULLABLE | Syllabus or overview |
| `credits` | INTEGER | NOT NULL, 1 to 10 | Credit hours |
| `department` | VARCHAR(50) | NULLABLE | Academic department |
| `status` | VARCHAR(20) | DEFAULT 'Active' | 'Active' or 'Archived' |
| `createdAt` | DATETIME | NOT NULL | Timestamp of record creation |
| `updatedAt` | DATETIME | NOT NULL | Timestamp of record last update |

#### 3. `enrollments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique enrollment identifier |
| `studentId` | INTEGER | NOT NULL, FOREIGN KEY -> `students.id` | Reference to student |
| `courseId` | INTEGER | NOT NULL, FOREIGN KEY -> `courses.id` | Reference to course |
| `enrollmentDate`| DATEONLY | NOT NULL, DEFAULT CURRENT_DATE | Date enrolled (YYYY-MM-DD) |
| `grade` | VARCHAR(20) | DEFAULT 'In Progress' | Grade (e.g., 'A', 'B+', 'In Progress') |
| `status` | VARCHAR(20) | DEFAULT 'Enrolled' | 'Enrolled', 'Completed', or 'Dropped' |
| `createdAt` | DATETIME | NOT NULL | Timestamp of record creation |
| `updatedAt` | DATETIME | NOT NULL | Timestamp of record last update |

> **Note**: A composite unique index `(studentId, courseId)` guarantees that a student cannot be enrolled in the exact same course more than once.

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or later)
- `npm` (Node Package Manager)

### Step 1: Clone or Navigate to the Workspace
```bash
cd CODSOFT_TASKSNO
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```bash
PORT=5000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

---

## Running the Application

### 1. Seed the Database (Recommended)
Populate the database with realistic sample students, courses, and enrollments:
```bash
npm run seed
```

### 2. Start in Development Mode (with Live Reload)
```bash
npm run dev
```

### 3. Start in Production Mode
```bash
npm start
```
The server will start listening at: `http://localhost:5000`

### 4. Run Automated Test Suite
Run the comprehensive test suite verifying all 23 scenarios:
```bash
npm test
```

---

## API Endpoints Reference

### Root & Health Check
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Welcome message and API overview |
| `GET` | `/api/health` | Health check endpoint returning status and available endpoints |

---

### Student Endpoints (`/api/students`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/students` | Get all students | `page`, `limit`, `search`, `status`, `gender`, `sortBy`, `sortOrder` |
| `POST` | `/api/students` | Create a new student | None (JSON body required) |
| `GET` | `/api/students/:id` | Get student by ID with enrollments and course details | None |
| `PUT` | `/api/students/:id` | Update student details by ID | None (JSON body required) |
| `DELETE` | `/api/students/:id` | Delete student by ID | None |

---

### Course Endpoints (`/api/courses`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/courses` | Get all courses | `page`, `limit`, `search`, `department`, `credits`, `status`, `sortBy`, `sortOrder` |
| `POST` | `/api/courses` | Create a new course | None (JSON body required) |
| `GET` | `/api/courses/:id` | Get course by ID with enrolled students | None |
| `PUT` | `/api/courses/:id` | Update course by ID | None (JSON body required) |
| `DELETE` | `/api/courses/:id` | Delete course by ID | None |

---

### Enrollment Endpoints (`/api/enrollments`)
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/enrollments` | Get all enrollments with student and course details | `page`, `limit`, `search`, `studentId`, `courseId`, `status`, `grade`, `sortBy`, `sortOrder` |
| `POST` | `/api/enrollments` | Enroll a student in a course | None (JSON body required) |
| `GET` | `/api/enrollments/:id`| Get enrollment by ID with student & course details | None |
| `PUT` | `/api/enrollments/:id`| Update enrollment (grade, status, enrollmentDate) | None (JSON body required) |
| `DELETE` | `/api/enrollments/:id`| Delete enrollment by ID | None |

---

## Query Parameters

### 1. Pagination
- `page`: Page number (default: `1`, min: `1`)
- `limit`: Items per page (default: `10`, max: `100`)

### 2. Search
- `search`: Substring search matching text across relevant fields:
  - Students: matches `firstName`, `lastName`, or `email`.
  - Courses: matches `courseCode`, `title`, `description`, or `department`.
  - Enrollments: matches `grade` or `status`.

### 3. Filtering
- **Students**:
  - `status`: Filter by `Active`, `Inactive`, `Graduated`, or `Suspended`.
  - `gender`: Filter by `Male`, `Female`, or `Other`.
- **Courses**:
  - `department`: Filter by department name (e.g. `Computer Science`).
  - `credits`: Filter by credit count (e.g. `4`).
  - `status`: Filter by `Active` or `Archived`.
- **Enrollments**:
  - `studentId`: Filter by student ID.
  - `courseId`: Filter by course ID.
  - `status`: Filter by `Enrolled`, `Completed`, or `Dropped`.
  - `grade`: Filter by specific grade (e.g. `A`).

### 4. Sorting
- `sortBy`: Field name to sort by (e.g., `firstName`, `courseCode`, `createdAt`, `id`).
- `sortOrder`: `ASC` or `DESC` (default: `DESC`).

---

## Example API Requests & Responses

### 1. Create a Student
**Request:**
```http
POST /api/students
Content-Type: application/json

{
  "firstName": "Grace",
  "lastName": "Hopper",
  "email": "grace.hopper@example.com",
  "phone": "+1-555-4321",
  "dateOfBirth": "2002-12-09",
  "gender": "Female",
  "status": "Active"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 6,
    "firstName": "Grace",
    "lastName": "Hopper",
    "email": "grace.hopper@example.com",
    "phone": "+1-555-4321",
    "dateOfBirth": "2002-12-09",
    "gender": "Female",
    "status": "Active",
    "createdAt": "2026-10-02T13:40:00.000Z",
    "updatedAt": "2026-10-02T13:40:00.000Z"
  }
}
```

---

### 2. Retrieve All Students (with Search & Pagination)
**Request:**
```http
GET /api/students?page=1&limit=2&search=John&sortBy=firstName&sortOrder=ASC
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "firstName": "Bob",
      "lastName": "Johnson",
      "email": "bob.johnson@example.com",
      "phone": "+1-555-0103",
      "dateOfBirth": "2000-11-30",
      "gender": "Male",
      "status": "Active",
      "createdAt": "2026-10-02T13:37:52.936Z",
      "updatedAt": "2026-10-02T13:37:52.936Z"
    },
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0101",
      "dateOfBirth": "2001-05-15",
      "gender": "Male",
      "status": "Active",
      "createdAt": "2026-10-02T13:37:52.936Z",
      "updatedAt": "2026-10-02T13:37:52.936Z"
    }
  ],
  "pagination": {
    "totalItems": 2,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 2,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3. Retrieve Student by ID (with Enrollments & Courses)
**Request:**
```http
GET /api/students/1
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "dateOfBirth": "2001-05-15",
    "gender": "Male",
    "status": "Active",
    "createdAt": "2026-10-02T13:37:52.936Z",
    "updatedAt": "2026-10-02T13:37:52.936Z",
    "enrollments": [
      {
        "id": 1,
        "studentId": 1,
        "courseId": 1,
        "enrollmentDate": "2025-01-15",
        "grade": "A",
        "status": "Completed",
        "course": {
          "id": 1,
          "courseCode": "CS101",
          "title": "Introduction to Computer Science",
          "credits": 4,
          "department": "Computer Science"
        }
      }
    ]
  }
}
```

---

### 4. Create an Enrollment
**Request:**
```http
POST /api/enrollments
Content-Type: application/json

{
  "studentId": 6,
  "courseId": 1,
  "enrollmentDate": "2025-09-15",
  "grade": "In Progress",
  "status": "Enrolled"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Enrollment created successfully",
  "data": {
    "id": 8,
    "studentId": 6,
    "courseId": 1,
    "enrollmentDate": "2025-09-15",
    "grade": "In Progress",
    "status": "Enrolled",
    "createdAt": "2026-10-02T13:42:00.000Z",
    "updatedAt": "2026-10-02T13:42:00.000Z",
    "student": {
      "id": 6,
      "firstName": "Grace",
      "lastName": "Hopper",
      "email": "grace.hopper@example.com",
      "status": "Active"
    },
    "course": {
      "id": 1,
      "courseCode": "CS101",
      "title": "Introduction to Computer Science",
      "credits": 4,
      "department": "Computer Science"
    }
  }
}
```

---

## Error Handling & Status Codes

All errors follow a consistent, informative JSON structure:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### HTTP Status Codes
| Status Code | Reason | Meaning |
|---|---|---|
| `200 OK` | Success | The request succeeded (GET, PUT, DELETE). |
| `201 Created` | Created | The resource was created successfully (POST). |
| `400 Bad Request` | Validation Error | Joi validation failed, invalid data format, or missing required fields. |
| `404 Not Found` | Not Found | Requested student, course, enrollment, or API endpoint was not found. |
| `409 Conflict` | Conflict | Duplicate entry (e.g. duplicate email, course code, or already enrolled). |
| `500 Internal Error` | Server Error | Unhandled server error. |

---

## Testing

An automated test suite is provided in `test-api.js`. It tests:
- Server welcome & health check
- Pagination, search, filtering, and sorting
- Joi validation errors on missing/malformed fields
- Duplicate prevention (409 Conflict) for students, courses, and enrollments
- Non-existent resource handling (404 Not Found)
- Full CRUD cycle for students, courses, and enrollments
- Route not found (404)

Run the test suite anytime:
```bash
npm test
```
All 23 automated tests should pass with `0 failed`.

---

## License
MIT License. Built for educational and internship assessment purposes.
