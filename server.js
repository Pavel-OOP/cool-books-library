if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended:false}))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)


const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")
const mongooseToSwagger = require("mongoose-to-swagger")
const options = {
  definition:{
    openapi: "3.0.0",
    info:{
      title: "Library API",
      versions: "1.0.0",
      description: "A simple Express Library API"
    },
    server:[
      {
        url:"http://localhost:4000"
      }
    ]
  },
  apis: ["./routes/*.js"]
}
const specs = swaggerJsDoc(options)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))
const Book = require('./models/book')
const swaggerSchema = mongooseToSwagger(Book)
console.log(swaggerSchema)
// tests vvv
arr = []
    Book.find({}, (err, data) => 
    {data.find(item => {
      console.log({"title" : item.title})
    })})
  
//tests ^^^

const server = app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

module.exports = {server, app}; 