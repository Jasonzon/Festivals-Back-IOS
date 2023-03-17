const router = require("express").Router()
const pool = require("../db")
const jwt = require("jsonwebtoken")
const auth = require("../utils/auth")
const bcrypt = require("bcrypt")
const jwtGenerator = require("../utils/jwtGenerator")

router.get("/", auth, async (req,res) => {
    try {
        if (req.role === "admin") {
            const allPolyusers = await pool.query("SELECT * FROM polyuser")
            return res.status(200).json(allPolyusers.rows)
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/id/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        if (req.polyuser.toString() === id.toString()) {
            const polyuser = await pool.query("SELECT * FROM polyuser WHERE polyuser_id = $1",[id])
            if (polyuser.rows.length === 0) {
                return res.status(404).send("Not found")
            }
            return res.status(200).json(polyuser.rows[0])
        }
        return res.status(403).send("Not authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/mail/:id", async (req,res) => {
    try {
        const {id} = req.params
        const polyuser = await pool.query("SELECT polyuser_mail FROM polyuser WHERE polyuser_mail = $1",[id])
        res.status(200).json(polyuser.rows)
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
        return res.status(200).json({polyuser_id:payload.polyuser,polyuser_mail:payload.mail})
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", async (req,res) => {
    try {
        const {nom, prenom, mail, password} = req.body
        if (!nom || !prenom || !mail || !password || typeof nom !== "string" || typeof prenom !== "string" || typeof mail !== "string" || typeof password !== "string" || nom.length === 0 || prenom.length === 0 || mail.length === 0 || password.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            return res.status(400).send("Wrong body")
        }
        const check = await pool.query("select * from polyuser where benevole_mail = $1",[mail])
        if (check.rows.length !== 0) {
            return res.status(409).send("Already exists")
        }
        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const bcryptPassword = await bcrypt.hash(password, salt)
        const newPolyuser = await pool.query("INSERT INTO polyuser (polyuser_nom, polyuser_prenom, polyuser_mail, polyuser_password) VALUES ($1, $2, $3, $4) RETURNING *", [nom, prenom, mail, bcryptPassword])
        const token = jwtGenerator(newPolyuser.rows[0].polyuser_id,newPolyuser.rows[0].polyuser_role,newPolyuser.rows[0].polyuser_mail)
        return res.status(200).json({rows:newPolyuser.rows,token})
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
        const newPolyuser = await pool.query("SELECT * FROM polyuser WHERE polyuser_mail = $1", [mail])
        if (newPolyuser.rows.length !== 0) {
            const validPassword = await bcrypt.compare(password,newPolyuser.rows[0].polyuser_password)
            if (validPassword) {
                const token = jwtGenerator(newPolyuser.rows[0].polyuser_id,newPolyuser.rows[0].polyuser_role,newPolyuser.rows[0].polyuser_mail)
                return res.status(200).json({rows:newPolyuser.rows,token})
            }
            return res.status(403).send({rows:[]})
        }
        return res.status(404).send("Not found")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.put("/id/:id", auth, async (req,res) => {
    try {
        const {id} = req.params
        const {nom, prenom, mail} = req.body
        if (!nom || !prenom || !mail || typeof nom !== "string" || typeof prenom !== "string" || typeof mail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || mail.length === 0 || nom.length === 0 || prenom.length === 0) {
            return res.status(409).send("Wrong body")
        }
        const user = req.polyuser
        if (user && user.toString() === id.toString()) {
            const updatePolyuser = await pool.query("UPDATE polyuser SET polyuser_name = $2, polyuser_description = $3 WHERE polyuser_id = $1 RETURNING *",[id, name, description])
            return res.status(200).json(updatePolyuser.rows[0])
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router