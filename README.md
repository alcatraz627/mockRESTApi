# Mock REST API

This project aims to build a barebones REST API, easily confugurable with a JSON schema. It is not intended to be used in production, rather is to be used to quicly bootstrap a REST API for initial development/testing.

## Dependencies
- [Low DB](https://github.com/typicode/lowdb)
- Express
- UUID

## Model Schema
The purpose of `schema.json` is to 
1. Configure the model for which the REST API will be created
1. Configure the api routes and available methods.
1. Seed the model with initial data.


A default schema.json is provided for reference and will be used if no schema is provided explicityly. To provide an external schema, pass the ```--schema /path/to/schema.json``` parameter. Will add the ability to upload and edit schema via GUI in the future.

### schema.json config
- Model name
- Base URL for REST API
- Methods: Allowed methods out of CRUD
- Model fields format:
    - \_id(optional)
    - type: {"string", "number", <to add more>}
    - default value(optional)
- Seed data

## TODO
- [ ] GUI to configure schema
- [ ] Ability to view and interact with all of db data on GUI
- [ ] Save and load DB data for persistence between launches
- [ ] Error Handling
- [ ] Automatic Tests
- [ ] Authentication configuration (Token login, Include Auth token in header)
- [ ] Better Documentation
