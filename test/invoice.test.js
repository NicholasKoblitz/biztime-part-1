process.env.NODE_ENV = "test";

const express = require("express");
const res = require("express/lib/response");
const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

let testInvo;
let testComp;

beforeAll( async () => {
    
})

beforeEach(async () => {
    // Adds company and invoice to test database
    let company = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('apple', 'Apple Computer', 'appletest') 
        RETURNING code, name, description`
    );
    let invoice = await db.query(
        `INSERT INTO invoices (comp_Code, amt, paid, paid_date)
        VALUES ('apple', 100, false, null)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`
    );
    
    testComp = company.rows[0];
    testInvo = invoice.rows[0];
    testInvo.add_date = testInvo.add_date.toISOString();
});


describe("GET /invocies", () => {
    test("Should return a list of invoices", async () => {
        const response = await request(app).get("/invoices");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({invoices: [testInvo]});
    });
})

describe("GET /invocies/:id", () => {
    test('should get a single invoice', async () => {
        const response = await request(app).get(`/invoices/${testInvo.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({invoice: testInvo});
    })
})

describe("POST /invoices", () => {
    test("should return a created invoice", async () => {
        const response = await request(app)
        .post("/invoices")
        .send({
            "comp_code": "apple",
            "amt": 400
        });

        let testDate = new Date();
        testDate.setHours(0);
        testDate.setMinutes(0);
        testDate.setSeconds(0);
        testDate.setMilliseconds(0)

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "apple",
                amt: 400,
                paid: false,
                add_date: testDate.toISOString(),
                paid_date: null
            }
        })
    })
})


describe("PUT /invoice/:id", () => {
    test("should return updated invoice", async () => {
        const response = await request(app)
        .put(`/invoices/${testInvo.id}`)
        .send({
            amt: 500
        })
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "apple",
                amt: 500,
                paid: false,
                add_date: testInvo.add_date,
                paid_date: null
            }
        })
    })
})


describe("DELETE /invoices/:id", () => {
    test("should return a delete message", async () => {
        const response = await request(app).delete(`/invoices/${testInvo.id}`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({msg: "Deleted"})
    })
})



afterEach(async () => {
    // Deletes company from database
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    // Ends connection to database
    await db.end();
});