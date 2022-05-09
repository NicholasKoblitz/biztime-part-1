const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const db = require("../db");


router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    }
    catch(e) {
        next(e);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        if(req.params.id) {
            const results = await db.query(`
            SELECT * FROM invoices
            WHERE id=$1`,
            [req.params.id])
        }
    }
    catch(e) {
        next(e);
    }
})


router.post("/", async (req, res, next) => {
    try {

    }
    catch(e) {
        next(e);
    }
})


router.put("/", async (req, res, next) => {
    try {

    }
    catch(e) {
        next(e);
    }
})


router.delete("/", async (req, res, next) => {
    try {

    }
    catch(e) {
        next(e);
    }
})


module.exports = router;