const http = require('http');
const { app } = require('./server');
const { connectDB } = require('./config/database');

const PORT = 5055; // Use dedicated test port
let serverInstance;
let baseUrl;

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(` [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  };

  try {
    // Ensure database is connected and synchronized before testing
    await connectDB();

    // Start temporary test server
    serverInstance = app.listen(PORT);
    baseUrl = `http://localhost:${PORT}`;
    console.log(`\n Starting Automated Test Suite at ${baseUrl}...\n`);

    // 1. Root & Health Check
    {
      const res = await fetch(`${baseUrl}/`);
      const body = await res.json();
      assert(res.status === 200 && body.success === true, 'GET / returns welcome payload');
    }

    {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = await res.json();
      assert(res.status === 200 && body.success === true, 'GET /api/health returns operational status');
    }

    // 2. Student Endpoints
    let createdStudentId;
    {
      // Retrieve all students
      const res = await fetch(`${baseUrl}/api/students?page=1&limit=3`);
      const body = await res.json();
      assert(
        res.status === 200 && body.data.length === 3 && body.pagination.totalItems >= 5,
        'GET /api/students pagination works correctly'
      );
    }

    {
      // Search students
      const res = await fetch(`${baseUrl}/api/students?search=Alice`);
      const body = await res.json();
      assert(
        res.status === 200 && body.data.some((s) => s.firstName === 'Alice'),
        'GET /api/students search by name works'
      );
    }

    {
      // Filter students by gender
      const res = await fetch(`${baseUrl}/api/students?gender=Female`);
      const body = await res.json();
      assert(
        res.status === 200 && body.data.every((s) => s.gender === 'Female'),
        'GET /api/students filter by gender works'
      );
    }

    {
      // Sort students
      const res = await fetch(`${baseUrl}/api/students?sortBy=firstName&sortOrder=ASC`);
      const body = await res.json();
      const names = body.data.map((s) => s.firstName);
      const isSorted = names.slice(1).every((item, i) => names[i].localeCompare(item) <= 0);
      assert(res.status === 200 && isSorted, 'GET /api/students sorting by firstName ASC works');
    }

    {
      // Validation failure on Create Student (missing required fields)
      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test' }),
      });
      const body = await res.json();
      assert(res.status === 400 && body.errors && body.errors.length > 0, 'POST /api/students Joi validation rejects missing email and lastName');
    }

    {
      // Create student successfully
      const newStudentPayload = {
        firstName: 'Robert',
        lastName: 'Patterson',
        email: 'robert.p@example.com',
        phone: '+1-555-9999',
        dateOfBirth: '2001-03-25',
        gender: 'Male',
        status: 'Active',
      };
      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentPayload),
      });
      const body = await res.json();
      assert(res.status === 201 && body.data.id, 'POST /api/students creates student successfully');
      createdStudentId = body.data.id;
    }

    {
      // Prevent duplicate student email
      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Another',
          lastName: 'Robert',
          email: 'robert.p@example.com',
        }),
      });
      assert(res.status === 409, 'POST /api/students rejects duplicate email with 409 Conflict');
    }

    {
      // Retrieve student by ID
      const res = await fetch(`${baseUrl}/api/students/${createdStudentId}`);
      const body = await res.json();
      assert(
        res.status === 200 && body.data.email === 'robert.p@example.com' && Array.isArray(body.data.enrollments),
        'GET /api/students/:id returns student with enrollments'
      );
    }

    {
      // Update student
      const res = await fetch(`${baseUrl}/api/students/${createdStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1-555-8888', status: 'Inactive' }),
      });
      const body = await res.json();
      assert(
        res.status === 200 && body.data.status === 'Inactive' && body.data.phone === '+1-555-8888',
        'PUT /api/students/:id updates student correctly'
      );
    }

    // 3. Course Endpoints
    let createdCourseId;
    {
      // Get all courses with filter
      const res = await fetch(`${baseUrl}/api/courses?department=Computer Science`);
      const body = await res.json();
      assert(
        res.status === 200 && body.data.every((c) => c.department === 'Computer Science'),
        'GET /api/courses filter by department works'
      );
    }

    {
      // Create course
      const coursePayload = {
        courseCode: 'BIO101',
        title: 'Introduction to Biology',
        description: 'Basic principles of cellular and organismal biology.',
        credits: 3,
        department: 'Biological Sciences',
        status: 'Active',
      };
      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursePayload),
      });
      const body = await res.json();
      assert(res.status === 201 && body.data.id, 'POST /api/courses creates course successfully');
      createdCourseId = body.data.id;
    }

    {
      // Prevent duplicate courseCode
      const res = await fetch(`${baseUrl}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: 'BIO101',
          title: 'Another Biology',
          credits: 3,
        }),
      });
      assert(res.status === 409, 'POST /api/courses rejects duplicate courseCode with 409 Conflict');
    }

    {
      // Update course
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Cellular and Molecular Biology' }),
      });
      const body = await res.json();
      assert(
        res.status === 200 && body.data.title === 'Cellular and Molecular Biology',
        'PUT /api/courses/:id updates course title'
      );
    }

    // 4. Enrollment Endpoints
    let createdEnrollmentId;
    {
      // Enroll newly created student in newly created course
      const res = await fetch(`${baseUrl}/api/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: createdStudentId,
          courseId: createdCourseId,
          enrollmentDate: '2025-09-10',
          grade: 'In Progress',
          status: 'Enrolled',
        }),
      });
      const body = await res.json();
      assert(
        res.status === 201 && body.data.student && body.data.course,
        'POST /api/enrollments creates enrollment with student & course relations'
      );
      createdEnrollmentId = body.data.id;
    }

    {
      // Prevent duplicate enrollment for same student and course
      const res = await fetch(`${baseUrl}/api/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: createdStudentId,
          courseId: createdCourseId,
        }),
      });
      assert(res.status === 409, 'POST /api/enrollments rejects duplicate enrollment with 409 Conflict');
    }

    {
      // Reject non-existent student or course enrollment
      const res = await fetch(`${baseUrl}/api/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 999999,
          courseId: createdCourseId,
        }),
      });
      assert(res.status === 404, 'POST /api/enrollments returns 404 when student does not exist');
    }

    {
      // Update enrollment (grade and status)
      const res = await fetch(`${baseUrl}/api/enrollments/${createdEnrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: 'A',
          status: 'Completed',
        }),
      });
      const body = await res.json();
      assert(
        res.status === 200 && body.data.grade === 'A' && body.data.status === 'Completed',
        'PUT /api/enrollments/:id updates grade and status'
      );
    }

    {
      // Delete enrollment
      const res = await fetch(`${baseUrl}/api/enrollments/${createdEnrollmentId}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      assert(res.status === 200 && body.success === true, 'DELETE /api/enrollments/:id deletes enrollment');
    }

    {
      // Delete student
      const res = await fetch(`${baseUrl}/api/students/${createdStudentId}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      assert(res.status === 200 && body.success === true, 'DELETE /api/students/:id deletes student');
    }

    {
      // Delete course
      const res = await fetch(`${baseUrl}/api/courses/${createdCourseId}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      assert(res.status === 200 && body.success === true, 'DELETE /api/courses/:id deletes course');
    }

    // 5. 404 Route handling
    {
      const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
      assert(res.status === 404, 'Unknown endpoint returns 404 Not Found');
    }

    console.log(`\n================================`);
    console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
