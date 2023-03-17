const router = require("express").Router()
const pool = require("../db")
const auth = require("../utils/auth")

router.get("/", async (req,res) => {
    try {
        const allFestivals = await pool.query("select * from festival")
        return res.status(200).json(allFestivals.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.get("/:id", async (req,res) => {
    try {
        const {id} = req.params
        const festival = await pool.query("select * from festival where festival_id = $1",[id])
        if (festival.rows.length === 0) {
            return res.status(404).send("Not found")
        }
        return res.status(200).json(festival.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

router.post("/", auth, async (req,res) => {
    try {
        if (req.role === "Admin") {
            const {name,year,days,open,debut,jour_debut,jour_fin} = req.body
            if (!jour_debut || !jour_fin || !name || !year || !days || open === undefined || !debut || typeof year !== "string" || typeof days !== "number" || typeof open !== "boolean" || typeof debut !== "string" || typeof name !== "string" || name.length === 0 || year.length === 0 || days.length === 0 || debut.length === 0) {
                return res.status(400).send("Wrong body")
            }
            const festival = await pool.query("insert into festival (festival_name, festival_year, festival_days, festival_open, festival_debut) values ($1, $2, $3, $4, $5) returning *",[name,year,days,open,debut])
            const festival_debut_date = new Date(debut);
            const day_milliseconds = 24 * 60 * 60 * 1000;
            for (let i = 0; i < days; i++) {
                const jour_date = new Date(festival_debut_date.getTime() + i * day_milliseconds)
                const jour_name = "Jour " + (i + 1)
                const jour = await pool.query("INSERT INTO jour (jour_name, jour_debut, jour_fin, jour_date, jour_festival) VALUES ($1, $2, $3, $4, $5) returning *",[jour_name,jour_debut,jour_fin,jour_date,festival.rows[0].festival_id])
                const nb_creneaux = Math.floor((jour_fin - jour_debut) / (2 * 60 * 60 * 1000))
                for (let j = 0; j < nb_creneaux; j++) {
                    const creneau_debut = new Date(jour_debut.getTime() + j * 2 * 60 * 60 * 1000);
                    const creneau_fin = new Date(jour_debut.getTime() + (j + 1) * 2 * 60 * 60 * 1000);
                    await pool.query("INSERT INTO creneau (creneau_debut, creneau_fin, creneau_jour) VALUES ($1, $2, $3)", [creneau_debut, creneau_fin, jour.rows[0].jour_id]);
                  }
            }
            await pool.query("insert into zone(zone_name,zone_benevoles,zone_festival) values ($1, $2, $3)",["Zone libre",3,festival.rows[0].festival_id])
            return res.status(200).json(festival.rows[0])
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
            const festival = await pool.query("update festival set festival_name = $2, festival_type = $3 where festival_id = $1 returning *",[id,name,type])
            return res.status(200).json(festival.rows[0])
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
            const festival = await pool.query("delete from festival where festival_id = $1 returning *",[id])
            return res.status(200).send("Deletion succeeded")
        }
        return res.status(403).send("Not Authorized")
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error")
    }
})

module.exports = router