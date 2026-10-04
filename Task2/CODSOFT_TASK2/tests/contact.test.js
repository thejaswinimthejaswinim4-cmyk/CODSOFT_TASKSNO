process.env.NODE_ENV = 'test';
process.env.DB_STORAGE = ':memory:';

const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { Contact } = require('../models');

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    // Reset contacts table before each test
    await Contact.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Health Check Endpoints', () => {
    test('GET / should return welcome message and endpoint index', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('Contact Management REST API');
        expect(res.body.endpoints).toBeDefined();
    });

    test('GET /health should return 200 and status OK', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.status).toBe('OK');
        expect(res.body.uptime).toBeDefined();
        expect(res.body.timestamp).toBeDefined();
    });

    test('GET /api/health should return 200 and status OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.status).toBe('OK');
    });
});

describe('POST /api/contacts (Create Contact)', () => {
    test('should create a contact with all valid fields', async () => {
        const newContact = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0199',
            address: '100 Main Street, Springfield',
            company: 'Acme Corp'
        };

        const res = await request(app)
            .post('/api/contacts')
            .send(newContact);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('created');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.name).toBe(newContact.name);
        expect(res.body.data.email).toBe(newContact.email);
        expect(res.body.data.phone).toBe(newContact.phone);
        expect(res.body.data.address).toBe(newContact.address);
        expect(res.body.data.company).toBe(newContact.company);
    });

    test('should create a contact with only required fields (name, email, phone)', async () => {
        const minimalContact = {
            name: 'Jane Roe',
            email: 'jane.roe@example.com',
            phone: '5551234567'
        };

        const res = await request(app)
            .post('/api/contacts')
            .send(minimalContact);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(minimalContact.name);
        expect(res.body.data.email).toBe(minimalContact.email);
        expect(res.body.data.address).toBeNull();
        expect(res.body.data.company).toBeNull();
    });

    test('should return 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/contacts')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Validation failed');
        expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });

    test('should return 400 for invalid email format', async () => {
        const res = await request(app)
            .post('/api/contacts')
            .send({
                name: 'Test User',
                email: 'invalid-email-address',
                phone: '1234567890'
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        const emailErr = res.body.errors.find(e => e.field === 'email');
        expect(emailErr).toBeDefined();
    });

    test('should return 400 for invalid phone number', async () => {
        const res = await request(app)
            .post('/api/contacts')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                phone: '123' // Too short (< 7 digits)
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        const phoneErr = res.body.errors.find(e => e.field === 'phone');
        expect(phoneErr).toBeDefined();
    });

    test('should return 409 when email already exists', async () => {
        await Contact.create({
            name: 'Original Contact',
            email: 'duplicate@example.com',
            phone: '555-000-1111'
        });

        const res = await request(app)
            .post('/api/contacts')
            .send({
                name: 'Duplicate Contact',
                email: 'duplicate@example.com',
                phone: '555-000-2222'
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('email already exists');
    });

    test('should return 409 when phone number already exists', async () => {
        await Contact.create({
            name: 'First Contact',
            email: 'first@example.com',
            phone: '555-999-8888'
        });

        const res = await request(app)
            .post('/api/contacts')
            .send({
                name: 'Second Contact',
                email: 'second@example.com',
                phone: '555-999-8888'
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('phone number already exists');
    });
});

describe('GET /api/contacts (Retrieve, Search, Sort & Paginate)', () => {
    beforeEach(async () => {
        // Seed 4 sample contacts for query tests
        await Contact.bulkCreate([
            {
                name: 'Alice Cooper',
                email: 'alice@rock.com',
                phone: '+1-555-1001',
                company: 'Rockstar Inc',
                address: '100 Sunset Blvd'
            },
            {
                name: 'Bob Dylan',
                email: 'bob@folk.com',
                phone: '+1-555-1002',
                company: 'Acoustic Records',
                address: '200 Greenwich St'
            },
            {
                name: 'Charlie Parker',
                email: 'charlie@jazz.com',
                phone: '+1-555-1003',
                company: 'Birdland Productions',
                address: '300 Harlem Ave'
            },
            {
                name: 'David Bowie',
                email: 'david@starman.com',
                phone: '+1-555-1004',
                company: 'Ziggy Studios',
                address: '400 Brixton Rd'
            }
        ]);
    });

    test('should return all contacts with pagination metadata', async () => {
        const res = await request(app).get('/api/contacts');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(4);
        expect(res.body.total).toBe(4);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.currentPage).toBe(1);
        expect(res.body.data.length).toBe(4);
    });

    test('should search contacts by name', async () => {
        const res = await request(app).get('/api/contacts?search=Dylan');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].name).toBe('Bob Dylan');
    });

    test('should search contacts by email', async () => {
        const res = await request(app).get('/api/contacts?search=jazz.com');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].email).toBe('charlie@jazz.com');
    });

    test('should search contacts by phone', async () => {
        const res = await request(app).get('/api/contacts?search=1004');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].phone).toBe('+1-555-1004');
    });

    test('should sort contacts by name in ASC order', async () => {
        const res = await request(app).get('/api/contacts?sortBy=name&order=ASC');

        expect(res.status).toBe(200);
        expect(res.body.data[0].name).toBe('Alice Cooper');
        expect(res.body.data[3].name).toBe('David Bowie');
    });

    test('should sort contacts by name in DESC order', async () => {
        const res = await request(app).get('/api/contacts?sortBy=name&order=DESC');

        expect(res.status).toBe(200);
        expect(res.body.data[0].name).toBe('David Bowie');
        expect(res.body.data[3].name).toBe('Alice Cooper');
    });

    test('should paginate results with page and limit', async () => {
        const res = await request(app).get('/api/contacts?page=1&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(2);
        expect(res.body.total).toBe(4);
        expect(res.body.pagination.totalPages).toBe(2);
        expect(res.body.pagination.hasNextPage).toBe(true);

        const page2Res = await request(app).get('/api/contacts?page=2&limit=2');
        expect(page2Res.status).toBe(200);
        expect(page2Res.body.count).toBe(2);
        expect(page2Res.body.pagination.hasPrevPage).toBe(true);
        expect(page2Res.body.pagination.hasNextPage).toBe(false);
    });

    test('should return 400 for invalid query parameters', async () => {
        const res = await request(app).get('/api/contacts?page=invalid&limit=abc&sortBy=badfield&order=WRONG');
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors.length).toBe(4);
    });
});

describe('GET /api/contacts/:id (Get Single Contact)', () => {
    test('should return contact by valid ID', async () => {
        const contact = await Contact.create({
            name: 'Miles Davis',
            email: 'miles@kindofblue.com',
            phone: '555-222-3333'
        });

        const res = await request(app).get(`/api/contacts/${contact.id}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(contact.id);
        expect(res.body.data.name).toBe('Miles Davis');
    });

    test('should return 404 for non-existent contact ID', async () => {
        const res = await request(app).get('/api/contacts/99999');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('not found');
    });

    test('should return 400 for invalid contact ID format', async () => {
        const res = await request(app).get('/api/contacts/not-a-number');

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Invalid contact ID format');
    });
});

describe('PUT /api/contacts/:id (Update Contact)', () => {
    test('should update existing contact fields', async () => {
        const contact = await Contact.create({
            name: 'Freddie Mercury',
            email: 'freddie@queen.com',
            phone: '555-123-0001',
            company: 'Queen Ltd'
        });

        const res = await request(app)
            .put(`/api/contacts/${contact.id}`)
            .send({
                name: 'Freddie Bulsara',
                company: 'Mercury Songs'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Freddie Bulsara');
        expect(res.body.data.company).toBe('Mercury Songs');
        expect(res.body.data.email).toBe('freddie@queen.com'); // Remains unchanged
    });

    test('should return 404 when updating non-existent contact', async () => {
        const res = await request(app)
            .put('/api/contacts/9999')
            .send({ name: 'Ghost Contact' });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test('should return 400 when no fields are provided in update body', async () => {
        const contact = await Contact.create({
            name: 'Brian May',
            email: 'brian@queen.com',
            phone: '555-123-0002'
        });

        const res = await request(app)
            .put(`/api/contacts/${contact.id}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('At least one field');
    });

    test('should return 409 when updating email to an existing contact email', async () => {
        const contact1 = await Contact.create({
            name: 'Contact One',
            email: 'taken@example.com',
            phone: '555-001-1111'
        });
        const contact2 = await Contact.create({
            name: 'Contact Two',
            email: 'unique@example.com',
            phone: '555-002-2222'
        });

        const res = await request(app)
            .put(`/api/contacts/${contact2.id}`)
            .send({ email: 'taken@example.com' });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('email already exists');
    });

    test('should return 409 when updating phone to an existing contact phone', async () => {
        const contact1 = await Contact.create({
            name: 'Contact One',
            email: 'first@mail.com',
            phone: '555-888-0000'
        });
        const contact2 = await Contact.create({
            name: 'Contact Two',
            email: 'second@mail.com',
            phone: '555-888-9999'
        });

        const res = await request(app)
            .put(`/api/contacts/${contact2.id}`)
            .send({ phone: '555-888-0000' });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('phone number already exists');
    });
});

describe('DELETE /api/contacts/:id (Delete Contact)', () => {
    test('should delete existing contact by ID', async () => {
        const contact = await Contact.create({
            name: 'To Be Deleted',
            email: 'delete.me@example.com',
            phone: '555-999-0000'
        });

        const res = await request(app).delete(`/api/contacts/${contact.id}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('deleted successfully');
        expect(res.body.data.id).toBe(contact.id);

        // Verify it is gone
        const check = await Contact.findByPk(contact.id);
        expect(check).toBeNull();
    });

    test('should return 404 when deleting non-existent contact', async () => {
        const res = await request(app).delete('/api/contacts/99999');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('not found');
    });

    test('should return 400 when deleting with invalid ID format', async () => {
        const res = await request(app).delete('/api/contacts/invalid-id');

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Not Found & Error Handling Middleware', () => {
    test('should return 404 for unknown endpoints', async () => {
        const res = await request(app).get('/api/unknown-route');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Resource not found');
    });
});
