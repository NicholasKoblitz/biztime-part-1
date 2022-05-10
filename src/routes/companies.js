const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows});
    }
    catch(e) {
        next(e);

    }
})

router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        return res.json({company: results.rows[0]})
    }
    catch(e) {
        next(e)
    }
})

router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, 
            [code, name, description]);
        return res.status(201).json({company: result.rows[0]});
    }
    catch(e) {
        next(e);
    }
})

router.put("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const codes = await db.query(`SELECT code FROM companies`);
        let validCode;
        for(let c of codes.rows) {
            if(req.params.code === c.code){
                validCode = c.code
            }
        }

        if(validCode) {
            const { name, description } = req.body;
            const results = await db.query(`
            UPDATE companies SET name=$1, description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [name, description, req.params.code]
            );
            return res.status(200).json({company: results.rows[0]});
        }
        else {
            return res.status(404).json({msg: "Code Not Found"})
        }
    }
    catch(e) {
        next(e);
    }
})

router.delete("/:code", async (req, res, next) => {
    try {

        const code = req.params.code;
        const codes = await db.query(`SELECT code FROM companies`);
        let validCode;
        for(let c of codes.rows) {
            if(req.params.code === c.code){
                validCode = c.code
            }
        }

        if(validCode) {
            const results = await db.query(`
            DELETE FROM companies
            WHERE code = $1`,
            [req.params.code]
            );
            return res.status(200).json({msg: "Deleted"});
        }
        else {
            return res.status(404).json({msg: "Code Not Found"})
        }
    }
    catch(e) {
        next(e);
    }
})

module.exports = router;