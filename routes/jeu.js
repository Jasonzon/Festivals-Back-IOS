const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

const type_enum = ['Enfant','Famille','Ambiance','Initie','Expert']

router.get("/", async (req,res) => {
    try {
        const allJeux = await pool.query("SELECT jeu.jeu_id, jeu.jeu_name, jeu.jeu_type, array_remove(array_agg(zone.zone_name), NULL) AS zones_affectees FROM jeu LEFT JOIN affectation ON jeu.jeu_id = affectation.affectation_jeu LEFT JOIN zone ON affectation.affectation_zone = zone.zone_id GROUP BY jeu.jeu_id;")
        return res.status(200).json(allJeux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const jeu = await pool.query("select * from jeu where jeu_id = $1",[id])
        if (jeu.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(jeu.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {name,type} = req.body
            if (!name || !type || typeof name !== "string" || typeof type !== "string" || name.length === 0 || !type_enum.includes(type)) {
                return res.status(400).send("Wrong body")
            }
            const jeu = await pool.query("insert into jeu (jeu_name, jeu_type) values ($1, $2) returning *",[name,type])
            return res.status(200).json(jeu.rows[0])
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
            const {name,type} = req.body
            if (!name || !type || typeof name !== "string" || typeof type !== "string" || name.length === 0 || !type_enum.includes(type)) {
                return res.status(400).send("Wrong body")
            }
            const jeu = await pool.query("update jeu set jeu_name = $2, jeu_type = $3 where jeu_id = $1 returning *",[id,name,type])
            return res.status(200).json(jeu.rows[0])
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
            const jeu = await pool.query("delete from jeu where jeu_id = $1 returning *",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router