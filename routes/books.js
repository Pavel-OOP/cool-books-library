const express = require("express")
const router = express.Router()
const Author = require("../models/author")
const Book = require("../models/book")

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

/**
 * @swagger
 * components:
 *  schemas:
 *    Book:
 *      type: object
 *      required:
 *        -title
 *        -publishDate
 *        -pageCount
 *        -createdAt
 *        -coverImage
 *        -coverImageType
 *        -author
 *      properties:
 *        title:
 *          type: string
 *        description:
 *          type: string
 *        publishDate:
 *          type: string
 *          format: date-time
 *        pageCount:
 *          type: number
 *        createdAt:
 *          type: string
 *          format: date-time
 *        coverImage:
 *          type: buffer
 *        coverImageType:
 *          type: string
 *        author:
 *          type: string
 *        id:
 *          type: string
 */

/**
 * @swagger
 * /books:
 *    get:
 *      summary: Returns the list of all the books
 *    responses:
 *      200:
 *        description: The list of the books
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Book'
 */
//all books route
router.get("/", async (req, res) => {
  let query = Book.find()
  if(req.query.title != null && req.query.title != ''){
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  
  try{
    const books = await query.exec()
    const isJSONResp = req.headers['postman-token']
    const resp = {
      status: "OK"
    }
    bookModel = mongoose.model('Book', Book.bookSchema )

    if(isJSONResp) {
      arr = []
    bookModel.find({}, (err, data) => 
    {data.map(item=>
    {arr.push({title: item.title})})
    arr.forEach(items => {
      res.json(...items)})})
    } else {
      res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  }
  }catch{
    res.redirect('/')
  }
})

// new book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book())
})

//create book route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)

  try{
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
  }catch{
    renderNewPage(res, book, true)
  }
})

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

// update
router.put('/:id', async (req, res) => {
  let book

  try{
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if(req.body.cover != null && req.body.cover !== ''){
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  }catch{
    if(book != null){
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
})

// Edit book route
router.get("/:id/edit", async (req, res) => {
  try{
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// delete book
router.delete('/:id', async (req, res) => {
 let book
 try{
   book = await Book.findById(req.params.id)
   await book.remove()
   res.redirect('/books')
 }catch{
   if(book != null){
     res.render('books/show', {
       book: book,
       errorMessage: 'Could not remove book'
     })
   } else {
     res.redirect('/')
   }
 }
})


async function renderFormPage(res, book, form, hasError = false){
  try {
    const authors = await Author.find({})
    const params = {
      authors : authors,
      book: book
    }
    if (hasError) params.errorMessage = `Error ${form} Book`

      res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

async function renderNewPage(res, book, hasError = false){
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
 renderFormPage(res, book, 'edit', hasError)
}

function saveCover(book, coverEncoded){
  if(coverEncoded == null) return 
  const cover = JSON.parse(coverEncoded)
  if(cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router
