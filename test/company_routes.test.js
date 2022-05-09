process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

let testComp;

beforeEach(async () => {
    // Adds company to test database
    let query = await db.query(
        `INSERT INTO companies (code, name) 
        VALUES ('apple', 'Apple Computer') 
        RETURNING code, name`
    );
    testComp = query;
});

afterEach(async () => {
    // Deletes company from database
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    // Ends connection to database
    await db.end();
});