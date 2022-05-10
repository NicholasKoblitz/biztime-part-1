process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

let testComp;

beforeEach(async () => {
    // Adds company to test database
    let query = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('apple', 'Apple Computer', 'appletest') 
        RETURNING code, name, description`
    );
    testComp = query.rows[0];
});



describe("GET /companies", () => {
    test("should get status code 200", async () => {
        const response = await request(app).get("/companies");
        expect(response.statusCode).toBe(200);
    })
    test("should return a list of one company", async () => {
        const response = await request(app).get("/companies");
        expect(response.body).toEqual({companies: [testComp]});
    })
})

describe("GET /companies/:code", () => {
    test('should return a single company', async () => {
        const response = await request(app).get(`/companies/${testComp.code}`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({company: testComp});
    })
})

describe('POST /companies', () => {
    test('Should return a created company', async () => {
        const response = await request(app)
        .post('/companies')
        .send({
            "code": "newComp", 
            "name": "Comp", 
            "description": "TESTING"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            company: {
                "code": "newComp", 
                "name": "Comp", 
                "description": "TESTING" 
            }
        });
    })
})

describe('PUT /companies/:code', () => {
    test('should update a company', async () => {
        const response = await request(app)
            .put(`/companies/${testComp.code}`)
            .send({
                "name": "testing",
                "description": "This is a test"
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            company: {
               "code": "apple",
                "name": "testing",
                "description": "This is a test" 
            }
        });
    })
    test('should return code not found error', async () => {
        const response = await request(app)
            .put('/companies/toast')
            .send({
                "name": "toast",
                "description": "Bad Toast"
            });
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({msg: "Code Not Found"})
    })
})

describe('DELETE /companies/:code', () => {
    test("Should return a delete message", async () => {
        const response = await request(app).delete(`/companies/${testComp.code}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({msg: "Deleted"})
    })
    test('should return code not found error', async () => {
        const response = await request(app).delete("/companies/yes")
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({msg: "Code Not Found"})
    })
})


afterEach(async () => {
    // Deletes company from database
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    // Ends connection to database
    await db.end();
});