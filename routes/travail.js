const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
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
        const allTravaux = await pool.query("select * from travail inner join zone on (zone.zone_id = travail.travail_zone) inner join creneau on (creneau.creneau_id = travail.travail_creneau) where travail_creneau = $1",[id])
        return res.status(200).json(allTravaux.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {benevole,zone,creneau} = req.body
            if (!benevole || !zone || !creneau || typeof benevole !== "number" || typeof zone !== "number" || typeof creneau !== "number") {
                return res.status(409).send("Wrong body")
            }
            const travail = await pool.query("insert into travail (travail_benevole, travail_zone, travail_creneau) values ($1, $2, $3) returning *",[benevole,zone,creneau])
            return res.status(200).json(travail.rows[0])
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
            const {benevole,zone,creneau} = req.body
            if (!benevole || !zone || !creneau || typeof benevole !== "number" || typeof zone !== "number" || typeof creneau !== "number") {
                return res.status(409).send("Wrong body")
            }
            const travail = await pool.query("update travail set travail_benevole = $2, travail_zone = $3, travail_creneau = $4 where travail_id = $1 returning *",[id,benevole,zone,creneau])
            return res.status(200).json(travail.rows[0])
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
            const travail = await pool.query("delete from travail where travail_id = $1",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router