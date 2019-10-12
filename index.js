const fs = require('fs')
const path = require('path')
const uuid4 = require('uuid/v4')

const app = require('express')()

const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')

const db = low(new Memory())
// TODO: Take from args
const PORT = 3000

// See if custom schema is provided
const schemaFile = process.argc > 2 ? process.argv[2] : path.join(__dirname, 'schema.json')

try {
    let schema = JSON.parse(fs.readFileSync(schemaFile, { encoding: 'utf-8' }))
    // console.log(schema)
    db.defaults({ [schema.model]: [...schema.seed.map(s => ({ _id: uuid4(), ...s }))] }).write()
    dbModelRef = db.get(schema.model)

    let modelBaseURL = `${schema.baseUrl || "/" + schema.model}/`

    // Read
    if (schema.methods.includes("read")) {
        app.get(`${modelBaseURL}:id/`, (req, res) => {
            let obj = dbModelRef.find({ _id: req.params.id }).value()
            obj ? res.send(obj) : res.sendStatus(404)
        })

        app.get(modelBaseURL, (req, res) => res.json(dbModelRef.value()))
    } else {
        app.get(`${modelBaseURL}:id/`, (req, res) => res.status(405).send("Method does not exist"))
        app.get(`${modelBaseURL}`, (req, res) => res.status(405).send("Method does not exist"))
    }

    // Create
    if (schema.methods.includes("create")) {
        app.post(modelBaseURL, (req, res) => {
            // if conforms to schema AND does not already exist for given unique values, add to db. Cannot add primary keys.
        })
    } else {
        app.post(`${modelBaseURL}`, (req, res) => res.status(405).send("Method does not exist"))
    }

    // Update
    if (schema.methods.includes("update")) {
        // TODO
    } else {
        app.put(`${modelBaseURL}/:id/`, (req, res) => res.status(405).send("Method does not exist"))
        app.patch(`${modelBaseURL}/:id/`, (req, res) => res.status(405).send("Method does not exist"))
    }

    // Delete
    if (schema.methods.includes("delete")) {
        app.delete(`${modelBaseURL}:id/`, (req, res) => {
            // if exists in db, delete.
            let lookup = dbModelRef.find({ _id: req.params.id }).value()
            if (lookup) {
                dbModelRef.remove(d => d._id == req.params.id).write()
                res.sendStatus(204)
            } else {
                res.sendStatus(404)

            }
        })
    } else {
        app.delete(`${modelBaseURL}`, (req, res) => res.status(405).send("Method does not exist"))
    }

    app.listen(PORT, () => {
        console.log(`REST API started on port ${PORT} for model ${schema.model}, at path ${modelBaseURL}.\nEnabled methods: ${(schema.methods.join(", "))}`);
    });


} catch (error) {
    console.error(error)
}
