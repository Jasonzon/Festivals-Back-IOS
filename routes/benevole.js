const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allBenevoles = await pool.query("select * from benevole")
        return res.status(200).json(allBenevoles.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const benevole = await pool.query("select * from benevole where benevole_id = $1",[id])
        if (benevole.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(benevole.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/creneau/:id", async (req,res) => {
    try {
        const {id} = req.params
        const allBenevoles = await pool.query("select * from benevole inner join travail on (travail.travail_benevole = benevole.benevole_id) inner join creneau on (creneau.creneau_id = travail.travail_creneau) where creneau_id = $1",[id])
        return res.status(200).json(allBenevoles.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/zone/:id", async (req,res) => {
    try {
        const {id} = req.params
        const allBenevoles = await pool.query("select * from benevole inner join travail on (travail.travail_benevole = benevole.benevole_id) inner join zone on (zone.zone_id = travail.travail_zone) where zone_id = $1",[id])
        return res.status(200).json(allBenevoles.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const {prenom,nom,mail} = req.body
            if (!prenom || !nom || !mail || typeof nom !== "string" || typeof prenom !== "string" || typeof mail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || nom.length === 0 || prenom.length === 0 || mail.length === 0) {
                return res.status(400).send("Wrong body")
            }
            const check = await pool.query("select * from benevole where benevole_mail = $1",[mail])
            if (check.rows.length === 0) {
                const benevole = await pool.query("insert into benevole (benevole_prenom,benevole_nom,benevole_mail) values ($1, $2, $3) returning *",[prenom,nom,mail])
                return res.status(200).json(benevole.rows[0])
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
        if (req.role === "admin") {
            const {id} = req.params
            const {prenom,nom,mail} = req.body
            if (!prenom || !nom || !mail || typeof nom !== "string" || typeof prenom !== "string" || typeof mail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || nom.length === 0 || prenom.length === 0 || mail.length === 0) {
                return res.status(400).send("Wrong body")
            }
            const check = await pool.query("select * from benevole where benevole_mail = $1",[mail])
            if (check.rows.length === 0) {
                const benevole = await pool.query("update benevole set benevole_prenom = $2, benevole_nom = $3, benevole_mail = $4 where benevole_id = $1 returning *",[id,prenom,nom,mail])
                return res.status(200).json(benevole.rows[0])
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
        if (req.role === "admin") {
            const {id} = req.params
            const benevole = await pool.query("delete from benevole where benevole_id = $1 returning *",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router