const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        console.log(`GET /travail`)
        const allTravaux = await pool.query("select * from travail")
        return res.status(200).json(allTravaux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /travail/${id}`)
        const travail = await pool.query("select * from travail where travail_id = $1",[id])
        if (travail.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(travail.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/benevole/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /travail/benevole/${id}`)
        const allTravaux = await pool.query("select * from travail inner join zone on (zone.zone_id = travail.travail_zone) inner join creneau on (creneau.creneau_id = travail.travail_creneau) where travail_benevole = $1",[id])
        return res.status(200).json(allTravaux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/zone/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /travail/zone/${id}`)
        const allTravaux = await pool.query("select * from travail inner join zone on (zone.zone_id = travail.travail_zone) inner join creneau on (creneau.creneau_id = travail.travail_creneau) where travail_zone = $1",[id])
        return res.status(200).json(allTravaux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/creneau/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /travail/creneau/${id}`)
        const allTravaux = await pool.query("select * from travail inner join zone on (zone.zone_id = travail.travail_zone) inner join creneau on (creneau.creneau_id = travail.travail_creneau) where travail_creneau = $1",[id])
        return res.status(200).json(allTravaux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        console.log(`POST /travail`)
        console.log(req.body)
        const {travail_benevole,travail_zone,travail_creneau} = req.body
        if (req.benevole === travail_benevole) {
            if (!travail_benevole || !travail_zone || !travail_creneau || typeof travail_benevole !== "number" || typeof travail_zone !== "number" || typeof travail_creneau !== "number") {
                return res.status(409).send("Wrong body")
            }
            const travail = await pool.query("insert into travail (travail_benevole, travail_zone, travail_creneau) values ($1, $2, $3) returning *",[travail_benevole,travail_zone,travail_creneau])
            return res.status(200).json({ID:travail.rows[0].travail_id})
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
        console.log(`PUT /travail/${id}`)
        console.log(req.body)
        if (req.role === "Admin") {
            const {travail_benevole,travail_zone,travail_creneau} = req.body
            if (!travail_benevole || !travail_zone || !travail_creneau || typeof travail_benevole !== "number" || typeof travail_zone !== "number" || typeof travail_creneau !== "number") {
                return res.status(409).send("Wrong body")
            }
            const travail = await pool.query("update travail set travail_benevole = $2, travail_zone = $3, travail_creneau = $4 where travail_id = $1 returning *",[id,travail_benevole,travail_zone,travail_creneau])
            return res.status(200).json({ID:travail.rows[0].travail_id})
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
        console.log(`DELETE /travail/${id}`)
        if (req.role === "Admin") {
            await pool.query("delete from travail where travail_id = $1",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router