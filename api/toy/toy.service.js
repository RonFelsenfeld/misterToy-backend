import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const toyService = {
  remove,
  query,
  getById,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}

async function query(filterBy = { name: '' }, sortBy = { name: 1 }) {
  try {
    const criteria = {
      name: { $regex: filterBy.name, $options: 'i' },
    }

    if (filterBy.inStock !== null) criteria.inStock = filterBy.inStock
    if (filterBy.maxPrice) criteria.price = { $lte: +filterBy.maxPrice }
    if (filterBy.labels.length) criteria.labels = { $in: filterBy.labels }

    const collection = await dbService.getCollection('toys')
    var toys = await collection.find(criteria).sort(sortBy).toArray()

    return toys
  } catch (err) {
    logger.error('Cannot find toys', err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toys')
    var toy = collection.findOne({ _id: ObjectId(toyId) })
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toys')
    await collection.deleteOne({ _id: ObjectId(toyId) })
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toys')
    await collection.insertOne(toy)
    console.log(toy)

    const toyId = new ObjectId(toy._id)

    // Adding createdAt based on _id
    toy.createdAt = toyId.getTimestamp()
    await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toy })

    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
      inStock: toy.inStock,
      description: toy.description,
      labels: [...toy.labels],
    }

    const collection = await dbService.getCollection('toys')
    await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('toys')
    await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
    return msg
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toys')
    await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
    return msgId
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}
