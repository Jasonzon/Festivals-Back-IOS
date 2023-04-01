const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        console.log(`GET /jour`)
        const allJours = await pool.query("select * from jour")
        return res.status(200).json(allJours.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /jour/${id}`)
        const jour = await pool.query("select * from jour where jour_id = $1",[id])
        if (jour.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(jour.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/festival/:id", async (req,res) => {
    try {
        const {id} = req.params
        console.log(`GET /jour/festival/${id}`)
        const jour = await pool.query("select * from jour where jour_festival = $1",[id])
        return res.status(200).json(jour.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        console.log(`POST /jour`)
        console.log(req.body)
        if (req.role === "Admin") {
            const {jour_name,jour_debut,jour_fin,jour_date,jour_festival} = req.body
            const check = await pool.query("select * from festival where festival_id = $1",[jour_festival])
            if (!jour_name || !jour_debut || !jour_fin || !jour_date || !jour_festival || typeof jour_debut !== "string" || typeof jour_fin !== "string" || typeof jour_festival !== "number" || typeof jour_date !== "string" || typeof jour_name !== "string" || jour_name.length === 0 || jour_debut.length === 0 || jour_fin.length === 0 || jour_date.length === 0 || check.rows.length === 0) {
                return res.status(409).send("Wrong body")
            }
            const jour = await pool.query("insert into jour (jour_name, jour_debut, jour_fin, jour_date, jour_festival) values ($1, $2, $3, $4, $5) returning *",[jour_name,jour_debut,jour_fin,jour_date,jour_festival])
            const debutJour = new Date(`${jour_date} ${jour_debut}`);
            console.log(debutJour)
            const finJour = new Date(`${jour_date} ${jour_fin}`);
            console.log(finJour)
            const dureeCreneau = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
            const nbCreneaux = Math.floor((finJour - debutJour) / dureeCreneau);
            console.log(nbCreneaux)
            let creneaux = [];
            let debutCreneau = debutJour;
            for (let i = 0; i < nbCreneaux; i++) {
                var finCreneau
                if (i != nbCreneaux-1) {
                    finCreneau = new Date(debutCreneau.getTime() + dureeCreneau);
                }
                else {
                    finCreneau = new Date(finJour)
                }
                const creneau = {
                    creneau_debut: debutCreneau.toISOString().slice(11, 19),
                    creneau_fin: finCreneau.toISOString().slice(11, 19),
                    creneau_jour: jour.rows[0].jour_id
                };
                console.log(creneau)
                creneaux.push(creneau);
                debutCreneau = finCreneau;
            }
            await pool.query("insert into creneau (creneau_debut, creneau_fin, creneau_jour) values ($1, $2, $3)", creneaux.map((creneau) => [creneau.creneau_debut, creneau.creneau_fin, creneau.creneau_jour]));
            return res.status(200).json({ID:jour.rows[0].jour_id})
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
        console.log(`PUT /jour/${id}`)
        console.log(req.body)
        if (req.role === "Admin") {
            const {jour_name} = req.body
            if (!jour_name || typeof jour_name !== "string" || jour_name.length === 0) {
                return res.status(409).send("Wrong body")
            }
            const jour = await pool.query("update jour set jour_name = $2 where jour_id = $1 returning *",[id,jour_name])
            return res.status(200).json({ID:jour.rows[0].jour_id})
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
        console.log(`DELETE /jour/${id}`)
        if (req.role === "Admin") {
            await pool.query("delete from jour where jour_id = $1",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router