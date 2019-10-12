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
    // console.log(db.get(schema.model).value())

    app.get(`${schema.baseUrl || "/" + schema.model}/`, (req, res) => res.json(db.get(schema.model).value()))

    app.listen(PORT, () => {
        console.log(`REST API started on port ${PORT} for model ${schema.model}.\nEnabled routes: ${(schema.methods.join(", "))}`);
    });


} catch (error) {
    console.log(error)
}
