import path from 'path'
import cors from 'cors'

import express from 'express'

import { loggerService } from './services/logger.service.js'
import { ToyService } from './services/toy.service.js'

const app = express()

const corsOptions = {
  origin: [
    'http://127.0.0.1:3030',
    'http://localhost:3030',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ],
  credentials: true,
}

// app.use(express.static('public'))
app.use(express.json())
app.use(cors(corsOptions))

app.get('/api/toy', (req, res) => {
  ToyService.query()
    .then(toys => {
      res.send(toys)
    })
    .catch(err => {
      loggerService.error('Cannot get toys', err)
      res.status(400).send('Cannot get toys')
    })
})

app.get('/**', (req, res) => {
  // res.sendFile(path.resolve('public/index.html'))
})

const PORT = 3030
app.listen(PORT, () => loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`))
