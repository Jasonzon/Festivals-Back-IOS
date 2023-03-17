const express = require("express")
const app = express()
const cors = require("cors")
const PORT = process.env.PORT || 5000
const path = require('path');

app.use(cors())
app.use(express.json())

app.use("/jeu", require("./routes/jeu"))

app.use("/benevole", require("./routes/benevole"))

app.use("/zone", require("./routes/zone"))

app.use("/affectation", require("./routes/affectation"))

app.use("/travail", require("./routes/travail"))

app.use("/creneau", require("./routes/creneau"))

app.use("/polyuser", require("./routes/polyuser"))

/*
app.get("/*", (req,res) => {
    res.sendFile(path.join(__dirname,"client/build/index.html"))
})
*/

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})