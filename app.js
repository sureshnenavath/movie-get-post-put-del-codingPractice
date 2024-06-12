const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log('DB Error: ${e.message}')
    process.exit(1)
  }
}
initializeDBAndServer()

const convertDbObjectToResponse0bject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const converdirctorDBobjecttoResponseobj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

// Get movie name API
app.get('/movies/', async (request, response) => {
  const getBooksQuery = `SELECT movie_name FROM movie; `
  const arrayy = await db.all(getBooksQuery)
  let fin = arrayy.map(book => ({movieName: book.movie_name}))
  response.send(fin)
})

//Get movie API
app.get('/movies/:movieId', async (req, res) => {
  let {movieId} = req.params
  let qurey = `
   SELECT 
      movie_id as movieId,
      director_id as directorId,
      movie_name as movieName,
      lead_actor as leadActor 
  FROM movie
      WHERE
         movie_id = ${movieId};`
  let result = await db.get(qurey)
  console.log(movieId)
  res.send(result)
})

// //Get post movie API
app.post('/movies/', async (request, res) => {
  // const bookDetails = request.body
  const {directorId, movieName, leadActor} = request.body
  const addMovieQuery = `
  INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}')`
  let movieadded = await db.run(addMovieQuery)

  res.send('Movie Successfully Added')
})

// //Get player put API
app.put('/movies/:movieId', async (req, res) => {
  let {movieId} = req.params

  const {directorId, movieName, leadActor} = req.body

  const updateBookQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
      WHERE 
       movie_id = ${movieId}; `
  let result = await db.run(updateBookQuery)
  res.send('Movie Details Updated')
})

// //Get player delete API
app.delete('/movies/:movieId', async (req, res) => {
  let {movieId} = req.params
  const deleteBookQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};`
  await db.run(deleteBookQuery)
  res.send('Movie Removed')
})

app.get('/directors/', async (req, res) => {
  let {authorId} = req.params
  const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        director;`
  let dbres = await db.all(getAuthorBooksQuery)
  res.send(dbres.map(a => converdirctorDBobjecttoResponseobj(a)))
})

app.get('/directors/:directorId/movies/', async (req, res) => {
  let {directorId} = req.params
  const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        movie
    WHERE 
      director_id = ${directorId};`
  let dbres = await db.all(getAuthorBooksQuery)
  res.send(dbres.map(a => ({movieName: a.movie_name})))
})

module.exports = app
