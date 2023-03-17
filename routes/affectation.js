const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allAffectations = await pool.query("select * from affectation inner join jeu on (jeu.jeu_id = affectation.affectation_jeu) inner join zone on (zone.zone_id = affectation.affectation_zone)")
        return res.status(200).json(allAffectations.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const affectation = await pool.query("select * from affectation where affectation_id = $1",[id])
        if (affectation.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(affectation.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/jeu/:id", async (req,res) => {
    try {
        const {id} = req.params
        const affectation = await pool.query("select * from affectation inner join zone on (affectation.affectation_zone = zone.zone_id) where affectation_jeu = $1",[id])
        return res.status(200).json(affectation.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/zone/:id", async (req,res) => {
    try {
        const {id} = req.params
        const affectation = await pool.query("select * from affectation inner join jeu on (affectation.affectation_jeu = jeu.jeu_id) where affectation_zone = $1",[id])
        return res.status(200).json(affectation.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {jeu,zone} = req.body
            if (!jeu || !zone || typeof jeu !== "number" || typeof zone !== "number") {
                return res.status(400).send("Wrong body")
            }
            const check = await pool.query("select * from affectation where affectation_jeu = $1 and affectation_zone = $2",[jeu,zone])
            if (check.rows.length === 0) {
                const affectation = await pool.query("WITH new_affectation AS (insert into affectation (affectation_jeu, affectation_zone) values ($1, $2) returning *) SELECT a.*, z.* FROM new_affectation a JOIN zone z ON z.zone_id = a.affectation_zone",[jeu,zone])
                return res.status(200).json(affectation.rows[0])
            }
            return res.status(409).send("Already exists")
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
            const {jeu,zone} = req.body
            if (!jeu || !zone || typeof jeu !== "number" || typeof zone !== "number") {
                return res.status(400).send("Wrong body")
            }
            const check = await pool.query("select * from affectation where affectation_jeu = $1 and affectation_zone = $2",[jeu,zone])
            if (check.rows.length === 0) {
                const affectation = await pool.query("update affectation set affectation_jeu = $2, affectation_zone = $3 from zone where affectation.affectation_id = $1 and affectation.affectation_zone = zone.zone_id returning affectation.*, zone.*",[id,jeu,zone])
                return res.status(200).json(affectation.rows[0])
            }
            return res.status(409).send("Already exists")
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
            const affectation = await pool.query("delete from affectation where affectation_id = $1",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router