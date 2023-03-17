const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const creneaux = await pool.query("select * from creneau")
        const creneauxModifies = creneaux.rows.map((creneau) => {
            const debutModifie = new Date(creneau.creneau_debut)
            debutModifie.setHours(debutModifie.getHours() + 1)
            const finModifie = new Date(creneau.creneau_fin)
            finModifie.setHours(finModifie.getHours() + 1)
            return {
                creneau_id: creneau.creneau_id,
                creneau_debut: debutModifie.toISOString(),
                creneau_fin: finModifie.toISOString()
            }
        })
        return res.status(200).json(creneauxModifies)
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
        const creneauDebut = new Date(creneau.rows[0].creneau_debut)
        creneauDebut.setHours(creneauDebut.getHours() + 1)
        const creneauFin = new Date(creneau.rows[0].creneau_fin)
        creneauFin.setHours(creneauFin.getHours() + 1)
        const creneauModifie = {
            creneau_id: creneau.rows[0].creneau_id,
            creneau_debut: creneauDebut.toISOString(),
            creneau_fin: creneauFin.toISOString()
        }
        return res.status(200).json(creneauModifie)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/zone/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("select distinct creneau_id,creneau_debut,creneau_fin from creneau inner join travail on (creneau.creneau_id = travail.travail_creneau) inner join zone on (travail.travail_zone = zone.zone_id) where zone_id = $1",[id])
        return res.status(200).json(creneau.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/benevole/:id", async (req,res) => {
    try {
        const {id} = req.params
        const creneau = await pool.query("select distinct creneau_id,creneau_debut,creneau_fin from creneau inner join travail on (creneau.creneau_id = travail.travail_creneau) inner join benevole on (travail.travail_benevole = benevole.benevole_id) where benevole_id = $1",[id])
        return res.status(200).json(creneau.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {debut,fin} = req.body
            if (!debut || !fin || typeof debut !== "string" || typeof fin !== "string" || debut >= fin) {
                return res.status(400).send("Wrong body")
            }
            const creneau = await pool.query("insert into creneau (creneau_debut,creneau_fin) values ($1::timestamp,$2::timestamp) returning *",[debut,fin])
            return res.status(200).json(creneau.rows[0])
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
            const {debut,fin} = req.body
            if (!debut || !fin || typeof debut !== "string" || typeof fin !== "string" || debut >= fin) {
                return res.status(400).send("Wrong body")
            }
            const creneau = await pool.query("update creneau set creneau_debut = $2, creneau_fin = $3 where creneau_id = $1 returning *",[id,debut,fin])
            return res.status(200).json(creneau.rows[0])
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
            const creneau = await pool.query("delete from creneau where creneau_id = $1 returning *",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router