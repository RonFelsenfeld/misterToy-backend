import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { reviewService } from './review.service.js'
import { ObjectId } from 'mongodb'

export async function getReviews(req, res) {
  const { filterBy } = req.query

  try {
    const reviews = await reviewService.query(filterBy)
    res.send(reviews)
  } catch (err) {
    logger.error('Cannot get reviews', err)
    res.status(400).send({ err: 'Failed to get reviews' })
  }
}

export async function deleteReview(req, res) {
  try {
    const deletedCount = await reviewService.remove(req.params.id)
    if (deletedCount === 1) {
      res.send({ msg: 'Deleted successfully' })
    } else {
      res.status(400).send({ err: 'Cannot remove review' })
    }
  } catch (err) {
    logger.error('Failed to delete review', err)
    res.status(400).send({ err: 'Failed to delete review' })
  }
}

export async function addReview(req, res) {
  var { loggedinUser } = req

  try {
    const { txt, aboutToyId } = req.body

    const reviewToAdd = {
      txt,
      toyId: new ObjectId(aboutToyId),
      userId: new ObjectId(loggedinUser._id),
    }

    const review = await reviewService.add(reviewToAdd)
    console.log(`review`, review)

    // User info is saved also in the login-token, update it
    const loginToken = authService.getLoginToken(loggedinUser)
    res.cookie('loginToken', loginToken)

    socketService.broadcast({ type: 'review-added', data: review, userId: loggedinUser._id })

    res.send(review)
  } catch (err) {
    logger.error('Failed to add review', err)
    res.status(400).send({ err: 'Failed to add review' })
  }
}
