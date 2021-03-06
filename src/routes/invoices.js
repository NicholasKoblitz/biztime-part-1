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
        const ids = await db.query(`SELECT id FROM invoices`);
        let validId;
        for(let i of ids.rows) {
            if(parseInt(req.params.id) === i.id){
                validId = i.id
            }
        }

        if(validId) {
            const results = await db.query(`
            SELECT * FROM invoices
            WHERE id=$1`,
            [validId])
            
            return res.json({invoice: results.rows[0]});
        }
        else {
            return res.json({msg: "Id not found"})
        }
    }
    catch(e) {
        next(e);
    }
})


router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`
            INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [comp_code, amt]);

            return res.status(201).json({invoice: results.rows[0]})
    }
    catch(e) {
        next(e);
    }
})


router.put("/:id", async (req, res, next) => {
    try {
        const ids = await db.query(`SELECT id FROM invoices`);
        let validId;
        for(let i of ids.rows) {
            if(parseInt(req.params.id) === i.id){
                validId = i.id
            }
        }
        if(validId) {
            const { amt, paid } = req.body;
            const paidQuery = await db.query(`SELECT paid FROM invoices WHERE id=$1`, [req.params.id])
            
            if(paid === paidQuery.rows[0].paid) {
                const results = await db.query(`
                UPDATE invoices SET amt=$1
                WHERE id=$3 AND paid=$2
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                [amt, paid, req.params.id])

                return res.json({invoice: results.rows[0]})
            }

            else if(paid) {
                const results = await db.query(`
                UPDATE invoices SET amt=$1, paid=$2, paid_date=$3
                WHERE id=$4
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                [amt, paid, new Date(), req.params.id])

                return res.json({invoice: results.rows[0]})
            }
            else if(!paid) {
                const results = await db.query(`
                UPDATE invoices SET amt=$1, paid_date=$2, paid=$4
                WHERE id=$3 AND NOT paid=$4
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                [amt, null, req.params.id, paid])

                return res.json({invoice: results.rows[0]})
            }
            

            
        }
        else {
            return res.json({msg: "Id not found"})
        }
    }
    catch(e) {
        next(e);
    }
})


router.delete("/:id", async (req, res, next) => {
    try {
        const ids = await db.query(`SELECT id FROM invoices`);
        let validId;
        for(let i of ids.rows) {
            if(parseInt(req.params.id) === i.id){
                validId = i.id
            }
        }
        if(validId) {
            const results = db.query(`
            DELETE FROM invoices 
            WHERE id=$1`,
            [validId]);

            return res.json({msg: "Deleted"})
        }
        else {
            return res.json({msg: "Id not found"})
        }
    }
    catch(e) {
        next(e);
    }
})


module.exports = router;