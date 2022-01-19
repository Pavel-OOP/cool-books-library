const chai = require("chai")
const chaiHttp = require("chai-http")
const {app} = require("../server")
const {assert} = chai

chai.use(chaiHttp)

describe('Server API', () => {

    describe('GET tests for Authors', () => {
        it('It should be valid status', (done) => {
            chai.request(app)
                .get('/authors/619b6d56f495660f81b7621e')
                .end((err, res) => {
                    
                    assert.equal(res.status, "200")
                    done()
                })
        })
    })

    describe('GET tests for Books', () => {
        it('It should be valid status', (done) => {
            chai.request(app)
                .get('/books')
                .end((err, res) => {
                    assert.equal(res.status, "200")
                    done()
                })
        })
    })

    after(() => {
        process.exit()
    })
})
