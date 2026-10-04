# CODSOFT Task 2 - Contact Management REST API

A scalable, robust Contact Management RESTful API built with **Node.js**, **Express.js**, **Sequelize ORM**, and **SQLite**.

---

## 🚀 Features

- **Full CRUD Operations**: Create, read, update, and delete contact records.
- **Data Validation**: Strict input validation for required fields, email format, and phone number patterns.
- **Duplicate Prevention**: Enforces unique email addresses and phone numbers with descriptive `409 Conflict` responses.
- **Search Capabilities**: Flexible keyword search across `name`, `email`, `phone`, and `company` fields.
- **Sorting**: Multi-field sorting (e.g., `name`, `email`, `createdAt`) in `ASC` or `DESC` order.
- **Pagination**: Configurable pagination using `page` and `limit` with complete pagination metadata.
- **Health Check Endpoint**: Built-in `/health` and `/api/health` endpoints for monitoring uptime.
- **Standardized JSON Responses**: Consistent response structure for both successful operations and error states.
- **Database Seeding**: Pre-loaded with realistic sample contacts.
- **Automated Test Suite**: Comprehensive integration and unit testing using **Jest** and **Supertest**.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (CommonJS)
- **Web Framework**: Express.js 5
- **ORM**: Sequelize 6
- **Database**: SQLite3
- **Testing**: Jest 30 & Supertest 7
- **Configuration**: dotenv & cors

---

## 📁 Project Structure

```text
CODSOFT_TASK2/
├── config/
│   └── database.js          # Sequelize connection & SQLite configuration
├── controllers/
│   └── contactController.js # Contact CRUD, search, sorting & pagination logic
├── middleware/
│   ├── errorHandler.js      # Global error and exception handling middleware
│   └── notFoundHandler.js   # 404 Route Not Found middleware
├── models/
│   ├── Contact.js           # Sequelize Contact model definition
│   └── index.js             # Model associations & centralized export
├── routes/
│   ├── contactRoutes.js     # Contact endpoint definitions
│   ├── healthRoutes.js      # Health check endpoints
│   └── index.js             # Centralized API router
├── tests/
│   └── contact.test.js      # Automated test suite (Jest & Supertest)
├── validators/
│   └── contactValidator.js  # Request validation middlewares
├── .env                     # Environment variables (PORT, DB_STORAGE)
├── .gitignore               # Ignored files (node_modules, .env, DB, coverage)
├── app.js                   # Express application setup and middleware mounting
├── package.json             # Dependencies and project scripts
├── seed.js                  # Database seeder script
├── server.js                # Server entry point and database synchronization
└── README.md                # Project documentation
```

---

## 📋 Contact Schema

| Field     | Type    | Required | Unique | Description                                        |
|-----------|---------|----------|--------|----------------------------------------------------|
| `id`      | Integer | Auto     | Yes    | Primary Key, auto-incrementing ID                  |
| `name`    | String  | Yes      | No     | Contact full name (2–100 characters)               |
| `email`   | String  | Yes      | Yes    | Unique valid email address                         |
| `phone`   | String  | Yes      | Yes    | Unique valid phone number (at least 7 digits)      |
| `address` | String  | No       | No     | Physical or mailing address (max 255 chars)        |
| `company` | String  | No       | No     | Company or organization name (max 100 chars)       |
| `createdAt` | DateTime | Auto   | No     | Timestamp when created                             |
| `updatedAt` | DateTime | Auto   | No     | Timestamp when last updated                        |

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Environment Configuration
The application is pre-configured with a `.env` file in the project root:
```env
PORT=5000
DB_STORAGE=./database.sqlite
```

### 3. Seed Sample Data
Populate the database with sample contacts:
```bash
node seed.js
```
*Alternatively, you can run:*
```bash
npm.cmd run seed
```

### 4. Start the Application
Start the server:
```bash
node server.js
```
*Or using npm:*
```bash
npm.cmd start
```

The server will start at `http://localhost:5000`.

---

## 🧪 Running Automated Tests

Run the test suite with Jest:
```bash
npm.cmd test
```

Tests run against an isolated in-memory SQLite database (`:memory:`) to ensure no side effects on the production/development database.

All 30 unit & integration test cases will execute:
- Health check endpoints (`/`, `/health`, `/api/health`)
- Contact creation with full and minimal payloads
- Validation error handling (missing/invalid name, email, phone)
- Duplicate email and phone prevention (`409 Conflict`)
- Contact retrieval, global search, and field-specific filtering
- Sorting ascending (`ASC`) and descending (`DESC`)
- Pagination (`page`, `limit`, total pages, next/prev flags)
- Contact lookup by ID (`200`, `400`, `404`)
- Contact updating with field validation and duplicate checks
- Contact deletion
- 404 route handling

---

## 📡 API Reference

Base URL: `http://localhost:5000`

### 1. Health Checks

#### `GET /health` or `GET /api/health`
Check if the service and database are operational.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "OK",
  "message": "Contact Management API is running.",
  "timestamp": "2026-10-04T08:47:24.457Z",
  "uptime": "21.66s"
}
```

---

### 2. Contacts Endpoints

#### `POST /api/contacts`
Create a new contact record.

**Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Sarah Connor",
  "email": "sarah.connor@cyberdyne.org",
  "phone": "+1-555-0199",
  "address": "987 Future Way, Los Angeles, CA",
  "company": "Cyberdyne Systems"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Contact created successfully.",
  "data": {
    "id": 7,
    "name": "Sarah Connor",
    "email": "sarah.connor@cyberdyne.org",
    "phone": "+1-555-0199",
    "address": "987 Future Way, Los Angeles, CA",
    "company": "Cyberdyne Systems",
    "createdAt": "2026-10-04T08:50:00.000Z",
    "updatedAt": "2026-10-04T08:50:00.000Z"
  }
}
```

---

#### `GET /api/contacts`
Retrieve contacts with search, sorting, and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search`  | string | none | Matches across `name`, `email`, `phone`, and `company` |
| `name`    | string | none | Filters specifically by name |
| `email`   | string | none | Filters specifically by email |
| `phone`   | string | none | Filters specifically by phone |
| `company` | string | none | Filters specifically by company |
| `sortBy`  | string | `createdAt` | Field to sort by (`id`, `name`, `email`, `phone`, `address`, `company`, `createdAt`, `updatedAt`) |
| `order`   | string | `DESC` | Sort direction (`ASC` or `DESC`) |
| `page`    | integer | `1` | Page number (min: `1`) |
| `limit`   | integer | `10` | Records per page (min: `1`, max: `100`) |

**Example Request:**
`GET /api/contacts?search=Tech&sortBy=name&order=ASC&page=1&limit=5`

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 5,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice.johnson@techcorp.com",
      "phone": "+1-555-0101",
      "address": "123 Silicon Valley Way, San Jose, CA",
      "company": "TechCorp Solutions",
      "createdAt": "2026-10-04T08:46:38.523Z",
      "updatedAt": "2026-10-04T08:46:38.523Z"
    }
  ]
}
```

---

#### `GET /api/contacts/:id`
Retrieve a single contact by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@techcorp.com",
    "phone": "+1-555-0101",
    "address": "123 Silicon Valley Way, San Jose, CA",
    "company": "TechCorp Solutions",
    "createdAt": "2026-10-04T08:46:38.523Z",
    "updatedAt": "2026-10-04T08:46:38.523Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Contact with ID 999 not found."
}
```

---

#### `PUT /api/contacts/:id`
Update an existing contact by ID.

**Request Body (Provide at least one field):**
```json
{
  "company": "Advanced Robotics Corp",
  "phone": "+1-555-9876"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact updated successfully.",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@techcorp.com",
    "phone": "+1-555-9876",
    "address": "123 Silicon Valley Way, San Jose, CA",
    "company": "Advanced Robotics Corp",
    "createdAt": "2026-10-04T08:46:38.523Z",
    "updatedAt": "2026-10-04T08:52:10.123Z"
  }
}
```

---

#### `DELETE /api/contacts/:id`
Delete a contact by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact deleted successfully.",
  "data": {
    "id": 1
  }
}
```

---

## ⚠️ Error Handling & Status Codes

| Status Code | Meaning | Example Scenario |
|-------------|---------|------------------|
| `200 OK` | Success | Record retrieved, updated, or deleted |
| `201 Created` | Created | New contact created successfully |
| `400 Bad Request` | Validation Error | Missing required fields, invalid email/phone, bad query param |
| `404 Not Found` | Not Found | Contact ID not found, unknown endpoint |
| `409 Conflict` | Duplicate Record | Email or phone number is already registered |
| `500 Server Error` | Server Exception | Internal unhandled database or server exception |

### Example 400 Bad Request:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address (e.g. user@example.com)."
    }
  ]
}
```

### Example 409 Conflict:
```json
{
  "success": false,
  "message": "A contact with this email already exists."
}
```
