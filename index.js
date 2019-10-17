const fs = require('fs')
const path = require('path')
const uuid4 = require('uuid/v4')

const express = require('express')
const bodyParser = require('body-parser')

const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')

const app = express()

const db = low(new Memory())

// Attaching bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('static'))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set('views', `${process.cwd()}/static`)

// Fetch port from --port arg if povided
let portArgIndex = JSON.parse(process.env.npm_config_argv).cooked.findIndex(e => e == "--port")
const PORT = portArgIndex == -1 ? 3000 : JSON.parse(process.env.npm_config_argv).cooked[portArgIndex + 1]

// See if custom schema is provided
const schemaFile = process.argc > 2 ? process.argv[2] : path.join(__dirname, 'schema.json')

try {
    let schema = JSON.parse(fs.readFileSync(schemaFile, { encoding: 'utf-8' }))
    db.defaults({ [schema.model]: [...schema.seed.map(s => ({ _id: uuid4(), ...s }))] }).write()
    dbModelRef = db.get(schema.model)

    let modelBaseURL = `${schema.baseUrl || "/" + schema.model}/`

    /** Read
     * @Route [GET] /<modelBaseURL>/ -> List Method
     * @Route [GET] /<modelBaseURL>/:id/ -> Retrieve Method
     */
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

    /** Create
     * @Route [POST] /<modelBaseURL>/ -> Create Method
     */
    if (schema.methods.includes("create")) {
        app.post(modelBaseURL, (req, res) => {
            // if conforms to schema AND does not already exist for given unique values, add to db. Cannot add primary keys.
            // dbModelRef.push({ _id: uuid4(), ...res.data }).write()
            console.log(req.body);
            // Validate body content and inject, else error->HTTP 400
            res.send("E")
        })
    } else {
        app.post(`${modelBaseURL}`, (req, res) => res.status(405).send("Method does not exist"))
    }

    /** Update
     * @Route [PUT] /<modelBaseURL>/:id/ -> Update Method
     * @Route [PATCH] /<modelBaseURL>/ -> Partial Update Method
     */
    if (schema.methods.includes("update")) {
        // TODO
    } else {
        app.put(`${modelBaseURL}/:id/`, (req, res) => res.status(405).send("Method does not exist"))
        app.patch(`${modelBaseURL}/:id/`, (req, res) => res.status(405).send("Method does not exist"))
    }

    /** Delete
     * @Route [DELETE] /<modelBaseURL>/:id/ -> Delere Method
     */
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

    /** Root documentation
     * @Route [GET] / -> Simple Documentation
     * @Route [GET] /schema/ -> JSON schema
     */
    app.get(`/`, (req, res) => {
        res.render("doc.html", { schema, PORT });
    })
    app.get(`/schema`, (req, res) => {
        res.json(schema)
    })

    app.listen(PORT, () => {
        console.log(`REST API started on port ${PORT} for model ${schema.model}, at path ${modelBaseURL}.\nEnabled methods: ${(schema.methods.join(", "))}`);
    });


} catch (error) {
    console.error(error)
}
