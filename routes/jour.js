const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allJours = await pool.query("select * from jour")
        return res.status(200).json(allJours.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const jour = await pool.query("select * from jour where jour_id = $1",[id])
        if (jour.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(jour.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/festival/:id", async (req,res) => {
    try {
        const {id} = req.params
        const jour = await pool.query("select * from jour where jour_festival = $1",[id])
        return res.status(200).json(jour.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {name,debut,fin,date,festival} = req.body
            const check = await pool.query("select * from festival where festival_id = $1",[festival])
            if (!name || !debut || !fin || !date || !festival || typeof debut !== "string" || typeof fin !== "string" || typeof festival !== "number" || typeof date !== "string" || typeof name !== "string" || name.length === 0 || debut.length === 0 || fin.length === 0 || date.length === 0 ||check.rows.length === 0) {
                return res.status(409).send("Wrong body")
            }
            const jour = await pool.query("insert into jour (jour_name, jour_debut, jour_fin, jour_date, jour_festival) values ($1, $2, $3, $4, $5) returning *",[name,debut,fin,date,festival])
            return res.status(200).json(jour.rows[0])
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.put("/:id", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {id} = req.params
            const {name,debut,fin,date,festival} = req.body
            const check = await pool.query("select * from festival where festival_id = $1",[festival])
            if (!name || !debut || !fin || !date || !festival || typeof debut !== "string" || typeof fin !== "string" || typeof date !== "string" || typeof festival !== "number" || typeof name !== "string" || name.length === 0 || debut.length === 0 || fin.length === 0 || date.length === 0 || check.rows.length === 0) {
                return res.status(409).send("Wrong body")
            }
            const jour = await pool.query("update jour set jour_name = $2, jour_debut = $3, jour_fin = $4, jour_date = $5, jour_festival = $6 where jour_id = $1 returning *",[id,name,debut,fin,date,festival])
            return res.status(200).json(jour.rows[0])
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.delete("/:id", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {id} = req.params
            const jour = await pool.query("delete from jour where jour_id = $1 returning *",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router