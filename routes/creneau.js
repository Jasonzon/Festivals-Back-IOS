const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const creneaux = await pool.query("select * from creneau")
        return res.status(200).json(creneaux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("select * from creneau where creneau_id = $1",[id])
        if (creneau.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(creneau.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/jour/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("select * from creneau where creneau_jour = $1",[id])
        return res.status(200).json(creneau.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {debut,fin,jour} = req.body
            if (!debut || !fin || !jour || typeof jour !== "number" || typeof debut !== "string" || typeof fin !== "string" || debut >= fin) {
                return res.status(400).send("Wrong body")
            }
            const creneau = await pool.query("insert into creneau (creneau_debut,creneau_fin,creneau_jour) values ($1,$2,$3) returning *",[debut,fin,jour])
            return res.status(200).json({ID:creneau.rows[0].creneau_id})
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router