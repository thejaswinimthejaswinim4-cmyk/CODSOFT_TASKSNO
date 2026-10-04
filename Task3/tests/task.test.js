const request = require("supertest");
const app = require("../server");

describe("Task Management REST API", () => {
    let createdTaskId;

    // 1. Health check
    test("1. GET /api/health should return 200", async () => {
        const response = await request(app)
            .get("/api/health");

        expect(response.statusCode).toBe(200);
    });

    // 2. Create task
    test("2. POST /api/tasks should create a task", async () => {
        const response = await request(app)
            .post("/api/tasks")
            .send({
                title: "Test Task",
                description: "Task created during automated testing"
            });

        expect([200, 201]).toContain(response.statusCode);

        expect(response.body).toBeDefined();

        // Support common response formats
        const task = response.body.task || response.body.data || response.body;

        expect(task).toBeDefined();

        if (task.id) {
            createdTaskId = task.id;
        }

        expect(task.title).toBe("Test Task");
    });

    // 3. Get all tasks
    test("3. GET /api/tasks should return tasks", async () => {
        const response = await request(app)
            .get("/api/tasks");

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
    });

    // 4. Get task by ID
    test("4. GET /api/tasks/:id should return a task", async () => {
        if (!createdTaskId) {
            const createResponse = await request(app)
                .post("/api/tasks")
                .send({
                    title: "Task for Get Test",
                    description: "Testing get by ID"
                });

            const task =
                createResponse.body.task ||
                createResponse.body.data ||
                createResponse.body;

            createdTaskId = task.id;
        }

        const response = await request(app)
            .get(`/api/tasks/${createdTaskId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
    });

    // 5. Update task
    test("5. PUT /api/tasks/:id should update a task", async () => {
        if (!createdTaskId) {
            const createResponse = await request(app)
                .post("/api/tasks")
                .send({
                    title: "Task for Update Test"
                });

            const task =
                createResponse.body.task ||
                createResponse.body.data ||
                createResponse.body;

            createdTaskId = task.id;
        }

        const response = await request(app)
            .put(`/api/tasks/${createdTaskId}`)
            .send({
                title: "Updated Test Task",
                description: "Updated description"
            });

        expect([200, 204]).toContain(response.statusCode);
    });

    // 6. Change task status
    test("6. PATCH /api/tasks/:id/status should change task status", async () => {
        if (!createdTaskId) {
            const createResponse = await request(app)
                .post("/api/tasks")
                .send({
                    title: "Task for Status Test"
                });

            const task =
                createResponse.body.task ||
                createResponse.body.data ||
                createResponse.body;

            createdTaskId = task.id;
        }

        const response = await request(app)
            .patch(`/api/tasks/${createdTaskId}/status`)
            .send({
                status: "completed"
            });

        expect([200, 204]).toContain(response.statusCode);
    });

    // 7. Filter by completed status
    test("7. GET /api/tasks?status=completed should filter completed tasks", async () => {
        const response = await request(app)
            .get("/api/tasks?status=completed");

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
    });

    // 8. Delete task
    test("8. DELETE /api/tasks/:id should delete the task", async () => {
        if (!createdTaskId) {
            const createResponse = await request(app)
                .post("/api/tasks")
                .send({
                    title: "Task for Delete Test"
                });

            const task =
                createResponse.body.task ||
                createResponse.body.data ||
                createResponse.body;

            createdTaskId = task.id;
        }

        const response = await request(app)
            .delete(`/api/tasks/${createdTaskId}`);

        expect([200, 204]).toContain(response.statusCode);
    });

    // 9. Missing title validation
    test("9. POST /api/tasks without title should return validation error", async () => {
        const response = await request(app)
            .post("/api/tasks")
            .send({
                description: "This task has no title"
            });

        expect([400, 422]).toContain(response.statusCode);
    });

    // 10. Non-existing task
    test("10. GET /api/tasks/999999 should return 404", async () => {
        const response = await request(app)
            .get("/api/tasks/999999");

        expect(response.statusCode).toBe(404);
    });
});