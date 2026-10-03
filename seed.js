const { sequelize, Student, Course, Enrollment } = require('./models');

const seedData = async () => {
  try {
    console.log(' Connecting to database and resetting tables...');
    await sequelize.sync({ force: true });

    console.log(' Seeding Students...');
    const students = await Student.bulkCreate([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        dateOfBirth: '2001-05-15',
        gender: 'Male',
        status: 'Active',
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        phone: '+1-555-0102',
        dateOfBirth: '2002-09-21',
        gender: 'Female',
        status: 'Active',
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1-555-0103',
        dateOfBirth: '2000-11-30',
        gender: 'Male',
        status: 'Active',
      },
      {
        firstName: 'Emma',
        lastName: 'Watson',
        email: 'emma.watson@example.com',
        phone: '+1-555-0104',
        dateOfBirth: '2003-02-18',
        gender: 'Female',
        status: 'Active',
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '+1-555-0105',
        dateOfBirth: '1999-07-10',
        gender: 'Male',
        status: 'Graduated',
      },
    ]);

    console.log(' Seeding Courses...');
    const courses = await Course.bulkCreate([
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of programming, algorithms, and computational thinking.',
        credits: 4,
        department: 'Computer Science',
        status: 'Active',
      },
      {
        courseCode: 'CS201',
        title: 'Data Structures and Algorithms',
        description: 'Advanced study of data structures like trees, graphs, and algorithmic efficiency.',
        credits: 4,
        department: 'Computer Science',
        status: 'Active',
      },
      {
        courseCode: 'MATH101',
        title: 'Calculus I',
        description: 'Differential and integral calculus with engineering and scientific applications.',
        credits: 3,
        department: 'Mathematics',
        status: 'Active',
      },
      {
        courseCode: 'PHYS101',
        title: 'General Physics I',
        description: 'Classical mechanics, thermodynamics, and wave phenomena.',
        credits: 4,
        department: 'Physics',
        status: 'Active',
      },
      {
        courseCode: 'ENG102',
        title: 'Technical Writing & Communication',
        description: 'Professional communication, technical documentation, and presentation skills.',
        credits: 2,
        department: 'Humanities',
        status: 'Active',
      },
    ]);

    console.log(' Seeding Enrollments...');
    await Enrollment.bulkCreate([
      {
        studentId: students[0].id,
        courseId: courses[0].id,
        enrollmentDate: '2025-01-15',
        grade: 'A',
        status: 'Completed',
      },
      {
        studentId: students[0].id,
        courseId: courses[1].id,
        enrollmentDate: '2025-09-01',
        grade: 'In Progress',
        status: 'Enrolled',
      },
      {
        studentId: students[1].id,
        courseId: courses[0].id,
        enrollmentDate: '2025-01-15',
        grade: 'B+',
        status: 'Completed',
      },
      {
        studentId: students[1].id,
        courseId: courses[2].id,
        enrollmentDate: '2025-09-01',
        grade: 'In Progress',
        status: 'Enrolled',
      },
      {
        studentId: students[2].id,
        courseId: courses[1].id,
        enrollmentDate: '2025-09-01',
        grade: 'In Progress',
        status: 'Enrolled',
      },
      {
        studentId: students[3].id,
        courseId: courses[3].id,
        enrollmentDate: '2025-02-01',
        grade: 'W',
        status: 'Dropped',
      },
      {
        studentId: students[4].id,
        courseId: courses[0].id,
        enrollmentDate: '2024-01-10',
        grade: 'A+',
        status: 'Completed',
      },
    ]);

    console.log(' Database seeded successfully with sample data!');
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
