import path from 'path'
import cors from 'cors'

import express from 'express'

import { loggerService } from './services/logger.service.js'

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

app.get('/api', (req, res) => {
  res.send('hello')
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const PORT = 3030
app.listen(PORT, () => loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`))
