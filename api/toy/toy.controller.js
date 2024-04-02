import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getToys(req, res) {
  try {
    const { filterBy: receivedFilter, sortBy } = req.query

    const filterBy = {
      name: receivedFilter?.name || '',
      inStock: receivedFilter?.inStock || null,
      labels: receivedFilter?.labels || [],
      maxPrice: +receivedFilter?.maxPrice || 0,
    }

    // filterBy.inStock arrives as a string --> Making it a boolean
    if (filterBy.inStock !== null) {
      filterBy.inStock = filterBy.inStock === 'true' ? true : false
    }

    // Dir arrives as a string --> Making it a number for mongo
    const sortByProp = Object.keys(sortBy)[0]
    sortBy[sortByProp] = +sortBy[sortByProp]

    logger.debug('Getting Toys', receivedFilter, sortBy)

    const toys = await toyService.query(filterBy, sortBy)
    res.json(toys)
  } catch (err) {
    logger.error('Failed to get toys', err)
    res.status(500).send({ err: 'Failed to get toys' })
  }
}

export async function getToyById(req, res) {
  try {
    const { toyId } = req.params
    const toy = await toyService.getById(toyId)
    res.json(toy)
  } catch (err) {
    logger.error('Failed to get toy', err)
    res.status(500).send({ err: 'Failed to get toy' })
  }
}

export async function addToy(req, res) {
  const { loggedinUser } = req

  try {
    const toy = req.body

    const addedToy = await toyService.add(toy)
    res.json(addedToy)
  } catch (err) {
    logger.error('Failed to add toy', err)
    res.status(500).send({ err: 'Failed to add toy' })
  }
}

export async function updateToy(req, res) {
  try {
    const toy = req.body
    const updatedToy = await toyService.update(toy)
    res.json(updatedToy)
  } catch (err) {
    logger.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

export async function removeToy(req, res) {
  try {
    const { toyId } = req.params
    await toyService.remove(toyId)
    res.send('Toy deleted')
  } catch (err) {
    logger.error('Failed to remove toy', err)
    res.status(500).send({ err: 'Failed to remove toy' })
  }
}

export async function addToyMsg(req, res) {
  const { loggedinUser } = req
  try {
    const { toyId } = req.params

    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
    }

    const savedMsg = await toyService.addToyMsg(toyId, msg)

    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

export async function removeToyMsg(req, res) {
  const { loggedinUser } = req

  try {
    const { toyId, msgId } = req.params
    const removedId = await toyService.removeToyMsg(toyId, msgId)

    socketService.broadcast({ type: 'review-removed', data: msgId, userId: loggedinUser._id })
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove toy msg', err)
    res.status(500).send({ err: 'Failed to remove toy msg' })
  }
}
