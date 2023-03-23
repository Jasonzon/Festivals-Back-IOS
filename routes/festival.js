const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        console.log(`GET /festival`)
        const allFestivals = await pool.query("select * from festival")
        return res.status(200).json(allFestivals.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /festival/${id}`)
        const festival = await pool.query("select * from festival where festival_id = $1",[id])
        if (festival.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(festival.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        console.log(`POST /festival`)
        console.log(req.body)
        if (req.role === "Admin") {
            const {festival_name,festival_year,festival_open} = req.body
            if (!festival_name || !festival_year || festival_open === undefined || typeof festival_year !== "string" || typeof festival_open !== "boolean" || typeof festival_name !== "string" || festival_name.length === 0 || festival_year.length === 0) {
                return res.status(400).send("Wrong body")
            }
            const festival = await pool.query("insert into festival (festival_name, festival_year, festival_open) values ($1, $2, $3) returning *",[festival_name,festival_year,festival_open])
            await pool.query("insert into zone(zone_name,zone_benevoles,zone_festival) values ($1, $2, $3)",["Zone libre",3,festival.rows[0].festival_id])
            return res.status(200).json({ID:festival.rows[0].festival_id})
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.put("/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        console.log(`PUT /festival/${id}`)
        console.log(req.body)
        if (req.role === "Admin") {
            const {festival_name,festival_year,festival_open} = req.body
            if (!festival_name || !festival_year || festival_open === undefined || typeof festival_year !== "string" || typeof festival_open !== "boolean" || typeof festival_name !== "string" || festival_name.length === 0 || festival_year.length === 0) {
                return res.status(400).send("Wrong body")
            }
            const festival = await pool.query("update festival set festival_name = $2, festival_year = $3, festival_open = $4 where festival_id = $1 returning *",[id,festival_name,festival_year,festival_open])
            return res.status(200).json({ID:festival.rows[0].festival_id})
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.delete("/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        console.log(`DELETE /festival/${id}`)
        if (req.role === "Admin") {
            await pool.query("delete from festival where festival_id = $1",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router