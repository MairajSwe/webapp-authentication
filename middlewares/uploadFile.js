const multer = require ("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/images/users') )
    },
    filename: function (req, file, cb) {
      
      cb(null, Date.now() + "-" + file.originalname)
    }
  })
  
  exports.upload = multer({ storage: storage })