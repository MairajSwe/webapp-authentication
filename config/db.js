const mongoose = require("mongoose")
const { dev } = require(".")

const connectDB = async () => {
    try {
        await mongoose.connect(dev.db.url)
        console.log("Database is connected")
    } catch (error) {
        console.log("database is not connected")
        console.log(error)
        process.exit(1)        
    }
}
module.exports= connectDB