const jwt = require("jsonwebtoken")
require("dotenv").config()

function jwtGenerator(benevole_id,benevole_role,benevole_mail) {
    const payload = {
        benevole:benevole_id,
        role:benevole_role,
        mail:benevole_mail
    }
    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"})
}

module.exports = jwtGenerator