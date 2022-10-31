require("dotenv").config()

exports.dev = {
    db: {
        url: process.env.DB_URL || "",
    },

    app: {
        port: process.env.SERVER_PORT,
        secret_key: process.env.SECRET_KEY || "",
        authEmail: process.env.AUTH_EMAIL,
        authPassword: process.env.AUTH_PASSWORD
    },
}