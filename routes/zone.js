const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allZones = await pool.query("select * from zone")
        return res.status(200).json(allZones.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const zone = await pool.query("select * from zone where zone_id = $1",[id])
        if (zone.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(zone.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/creneau/:id", async (req,res) => {
    try {
        const {id} = req.params
        const zone = await pool.query("select distinct zone_id,zone_name from zone inner join travail on (zone.zone_id = travail.travail_zone) inner join creneau on (travail.travail_creneau = creneau.creneau_id) where creneau_id = $1",[id])
        return res.status(200).json(zone.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/benevole/:id", async (req,res) => {
    try {
        const {id} = req.params
        const zone = await pool.query("select distinct zone_id,zone_name from zone inner join travail on (zone.zone_id = travail.travail_zone) inner join benevole on (travail.travail_benevole = benevole.benevole_id) where benevole_id = $1",[id])
        return res.status(200).json(zone.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {name} = req.body
            if (!name || typeof name !== "string" || name.length === 0) {
                return res.status(409).send("Wrong body")
            }
            const zone = await pool.query("insert into zone (zone_name) values ($1) returning *",[name])
            return res.status(200).json(zone.rows[0])
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.put("/:id", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {id} = req.params
            const {name} = req.body
            if (!name || typeof name !== "string" || name.length === 0) {
                return res.status(409).send("Wrong body")
            }
            const zone = await pool.query("update zone set zone_name = $2 where zone_id = $1 returning *",[id,name])
            return res.status(200).json(zone.rows[0])
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.delete("/:id", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {id} = req.params
            const zone = await pool.query("delete from zone where zone_id = $1 returning *",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router