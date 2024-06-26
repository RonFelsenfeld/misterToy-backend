import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import {
  getToys,
  getToyById,
  addToy,
  updateToy,
  removeToy,
  addToyMsg,
  removeToyMsg,
} from './toy.controller.js'

export const toyRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

toyRoutes.get('/', log, getToys)
toyRoutes.get('/:toyId', getToyById)
toyRoutes.post('/', requireAdmin, addToy)
toyRoutes.put('/:toyId', requireAdmin, updateToy)
toyRoutes.delete('/:toyId', requireAdmin, removeToy)

toyRoutes.post('/:toyId/msg', requireAuth, addToyMsg)
toyRoutes.delete('/:toyId/msg/:msgId', requireAuth, removeToyMsg)
