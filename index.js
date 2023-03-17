const express = require("express")
const app = express()
const cors = require("cors")
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use("/jeu", require("./routes/jeu"))

app.use("/benevole", require("./routes/benevole"))

app.use("/zone", require("./routes/zone"))

app.use("/affectation", require("./routes/affectation"))

app.use("/travail", require("./routes/travail"))

app.use("/creneau", require("./routes/creneau"))

app.use("/festival", require("./routes/festival"))

app.use("/jour", require("./routes/jour"))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})