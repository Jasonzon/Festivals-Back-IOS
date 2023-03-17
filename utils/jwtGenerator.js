const jwt = require("jsonwebtoken")
require("dotenv").config()

function jwtGenerator(polyuser_id,polyuser_role,polyuser_mail) {
    const payload = {
        polyuser:polyuser_id,
        role:polyuser_role,
        mail:polyuser_mail
    }

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"})
}

module.exports = jwtGenerator