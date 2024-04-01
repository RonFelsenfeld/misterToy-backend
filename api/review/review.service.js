import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('reviews')
    // const reviews = await collection.find(criteria).toArray()
    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            localField: 'toyId',
            from: 'toys',
            foreignField: '_id',
            as: 'aboutToy',
          },
        },
        {
          $unwind: '$aboutToy',
        },
        {
          $lookup: {
            localField: 'userId',
            from: 'users',
            foreignField: '_id',
            as: 'byUser',
          },
        },
        {
          $unwind: '$byUser',
        },
      ])
      .toArray()

    reviews = reviews.map(review => {
      review.aboutToy = {
        _id: review.aboutToy._id,
        name: review.aboutToy.name,
        price: review.aboutToy.price,
      }

      review.byUser = { _id: review.byUser._id, nickname: review.byUser.fullname }

      delete review.toyId
      delete review.userId

      return review
    })

    console.log(`reviews`, reviews)
    return reviews
  } catch (err) {
    logger.error('cannot find reviews', err)
    throw err
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    const collection = await dbService.getCollection('reviews')
    // remove only if user is owner/admin
    const criteria = { _id: new ObjectId(reviewId) }
    // if (!loggedinUser.isAdmin) criteria.byUserId = new ObjectId(loggedinUser._id)
    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

async function add(review) {
  try {
    const reviewToAdd = {
      toyId: review.toyId,
      userId: review.userId,
      txt: review.txt,
    }

    const collection = await dbService.getCollection('reviews')
    await collection.insertOne(reviewToAdd)
    return reviewToAdd
  } catch (err) {
    logger.error('cannot insert review', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.toyId) criteria.toyId = new ObjectId(filterBy.toyId)
  return criteria
}

export const reviewService = {
  query,
  remove,
  add,
}
