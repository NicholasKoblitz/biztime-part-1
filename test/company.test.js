process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");
const slugify = require("slugify");

let testComp;
let testInvo;

beforeEach(async () => {
    // Adds company to test database
    let company = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('apple', 'Apple Computer', 'appletest') 
        RETURNING code, name, description`
    );
    let invoive = await db.query(
        `INSERT INTO invoices (comp_Code, amt, paid, paid_date)
        VALUES ('apple', 100, false, null)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`
    );

    let i = await db.query(
        `INSERT INTO industries (code, industry)
        VALUES ('tech', 'Technology'),
                ('res', 'Research')`
    );

    let ic = await db.query(
        `INSERT INTO industries_companies (comp_code, indus_code)
        VALUES ('apple', 'tech')`
    );

    testComp = company.rows[0];
    testInvo = invoive.rows[0];
    testInvo.add_date = testInvo.add_date.toISOString();
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
        let { code, name, description} = testComp
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({company: {code, name, description, industries: ["Technology"]}});
    })
})

describe('POST /companies', () => {
    test('Should return a created company', async () => {
        const response = await request(app)
        .post('/companies')
        .send({
            "name": "Comp", 
            "description": "TESTING"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            company: {
                "code": slugify("Comp"), 
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
    await db.query(`DELETE FROM industries`);
    await db.query(`DELETE FROM industries_companies`);
});

afterAll(async () => {
    // Ends connection to database
    await db.end();
});