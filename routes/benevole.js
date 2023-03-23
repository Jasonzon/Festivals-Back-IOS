const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const jwtGenerator = require("../utils/jwtGenerator")

router.get("/", async (req,res) => {
    try {
        console.log("GET /benevole")
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
        console.log(`GET /benevole/${id}`)
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

router.get("/zone/:query", async (req,res) => {
    try {
        const {creneau,zone} = req.query
        const allBenevoles = await pool.query("select * from benevole inner join travail on (travail.travail_benevole = benevole.benevole_id) inner join zone on (zone.zone_id = travail.travail_zone) where zone_id = $1 and creneau_id = $2",[zone,creneau])
        return res.status(200).json(allBenevoles.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", async (req,res) => {
    try {
        console.log(`POST /benevole`)
        console.log(req.body)
        const {benevole_prenom,benevole_nom,benevole_mail,benevole_password} = req.body
        if (!benevole_prenom || !benevole_nom || !benevole_mail || !benevole_password || typeof benevole_password !== "string" || typeof benevole_nom !== "string" || typeof benevole_prenom !== "string" || typeof benevole_mail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(benevole_mail) || benevole_password.length === 0 || benevole_nom.length === 0 || benevole_prenom.length === 0 || benevole_mail.length === 0) {
            return res.status(400).send("Wrong body")
        }
        const check = await pool.query("select * from benevole where benevole_mail = $1",[benevole_mail])
        if (check.rows.length !== 0) {
            return res.status(409).send("Already exists")
        }
        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const bcryptPassword = await bcrypt.hash(benevole_password, salt)
        const newPolyuser = await pool.query("INSERT INTO benevole (benevole_nom, benevole_prenom, benevole_mail, benevole_password) VALUES ($1, $2, $3, $4) RETURNING *", [benevole_nom, benevole_prenom, benevole_mail, bcryptPassword])
        const token = jwtGenerator(newPolyuser.rows[0].benevole_id,newPolyuser.rows[0].benevole_role,newPolyuser.rows[0].benevole_mail)
        return res.set(token).status(200).json({ID:newPolyuser.rows[0].benevole_id})
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.put("/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        console.log(`PUT /benevole/${id}`)
        console.log(req.body)
        if (req.role === "Admin") {
            const {benevole_prenom,benevole_nom,benevole_mail} = req.body
            const user = req.benevole
            if (user && user.toString() !== id.toString()) {
                return res.status(403).send("Not Authorized")
            }
            if (!benevole_prenom || !benevole_nom || !benevole_mail || typeof benevole_nom !== "string" || typeof benevole_prenom !== "string" || typeof benevole_mail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(benevole_mail) || benevole_nom.length === 0 || benevole_prenom.length === 0 || benevole_mail.length === 0) {
                return res.status(400).send("Wrong body")
            }
            const check = await pool.query("select * from benevole where benevole_mail = $1",[benevole_mail])
            if (check.rows.length !== 0) {
                return res.status(409).send("Already exists")
            }
            const benevole = await pool.query("update benevole set benevole_prenom = $2, benevole_nom = $3, benevole_mail = $4 where benevole_id = $1 returning *",[id,benevole_prenom,benevole_nom,benevole_mail])
            return res.status(200).json({ID:benevole.rows[0].benevole_id})
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
        console.log(`DELETE /benevole/${id}`)
        if (req.role === "Admin") {
            await pool.query("delete from benevole where benevole_id = $1",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/auth", async (req,res) => {
    try {
        const jwtToken = req.header("token")
        if (!jwtToken) {
            return res.status(403).send("No authentication token")
        }
        const payload = jwt.verify(jwtToken, process.env.jwtSecret)
        if (!payload) {
            return res.status(403).send("Not authorized")
        }
        return res.status(200).json({id:payload.benevole})
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/connect", async (req,res) => {
    try {
        const {mail, password} = req.body
        if (!mail || !password || typeof mail !== "string" || typeof password !== "string" || mail.length === 0 || password.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            return res.status(409).send("Wrong body")
        }
        const newPolyuser = await pool.query("SELECT * FROM benevole WHERE benevole_mail = $1", [mail])
        if (newPolyuser.rows.length !== 0) {
            const validPassword = await bcrypt.compare(password,newPolyuser.rows[0].benevole_password)
            if (validPassword) {
                const token = jwtGenerator(newPolyuser.rows[0].benevole_id,newPolyuser.rows[0].benevole_role,newPolyuser.rows[0].benevole_mail)
                return res.status(200).json({benevole:newPolyuser.rows[0],token})
            }
            return res.status(403).send("Not authorized")
        }
        return res.status(404).send("Not found")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router