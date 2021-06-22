import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import router from './src/routes.js'
import {authenticate} from './src/helpers.js'
const port = 8080
const app = express()
app.use(authenticate)
app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(router);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})