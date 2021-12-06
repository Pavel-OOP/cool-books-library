const chai = require("chai")
const chaiHttp = require("chai-http")
const { init } = require("../models/author")
const server = require("../server")

chai.use("chaiHttp")

describe('Server API', ()=> {
    
    describe('GET tests', () => {
        it('It should be valid status', (done)=>{
            chai.request(server)
                .get('/server/authors')
                .end((err, res)=>{
                    assert.equal(res.status(), "200");
                })
        })
    })

})