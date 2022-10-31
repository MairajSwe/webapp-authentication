const clientError = (req, res, next) => {
    res.status(404).send({
        message: "404 not found"
    })
}

const serverError = (err, req, res, next) => {
    res.status(500).send({
        message: err.message
    })
}

module.exports = {clientError, serverError}