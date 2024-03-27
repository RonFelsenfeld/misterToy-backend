import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'
import { createPublicKey } from 'crypto'
import { CLIENT_RENEG_LIMIT } from 'tls'

export const toyService = {
  query,
  getById,
  remove,
  save,
}

const toys = utilService.readJsonFile('data/toys.json')

function query(filterBy = {}, sortBy = { name: 1 }) {
  let toysToReturn = toys.slice()

  toysToReturn = _filterToys(toysToReturn, filterBy)
  toysToReturn = _sortToys(toysToReturn, sortBy)

  return Promise.resolve(toysToReturn)
}

function getById(toyId) {
  const toy = toys.find(toy => toy._id === toyId)
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex(toy => toy._id === toyId)
  if (idx === -1) return Promise.reject('No such toy')

  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {
  if (toy._id) {
    const toyToUpdate = toys.find(currToy => currToy._id === toy._id)

    toyToUpdate.name = toy.name
    toyToUpdate.price = toy.price
    toyToUpdate.inStock = toy.inStock

    toy = toyToUpdate
  } else {
    toy._id = utilService.makeId()
    toy.createdAt = Date.now()
    toy.description = utilService.makeLorem(30)

    // ! MOVE TO FRONT - USER PICK
    toy.labels = []
    const labels = _getLabels()
    while (toy.labels.length < 3) {
      const rndLabel = labels[utilService.getRandomIntInclusive(0, labels.length - 1)]
      if (!toy.labels.includes(rndLabel)) toy.labels.push(rndLabel)
    }

    toys.push(toy)
  }

  return _saveToysToFile().then(() => toy)
}

////////////////////////////////////////////////////

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(toys, null, 4)
    fs.writeFile('data/toys.json', data, err => {
      if (err) {
        loggerService.error('Cannot write to toys file', err)
        return reject(err)
      }
      resolve()
    })
  })
}

// ! MOVE TO FRONT - USER PICK
function _getLabels() {
  const labels = [
    'On wheels',
    'Box game',
    'Art',
    'Baby',
    'Doll',
    'Puzzle',
    'Outdoor',
    'Battery Powered',
  ]

  return labels
}

function _filterToys(toys, filterBy) {
  if (filterBy.name) {
    const regExp = new RegExp(filterBy.name, 'i')
    toys = toys.filter(toy => regExp.test(toy.name))
  }

  if (filterBy.inStock !== null) {
    // filterBy.inStock is a string that 'true' or 'false', so it need to be converted to boolean
    filterBy.inStock = filterBy.inStock === 'true' ? true : false

    switch (filterBy.inStock) {
      case true:
        toys = toys.filter(toy => toy.inStock)
        break

      case false:
        toys = toys.filter(toy => !toy.inStock)
        break
    }
  }

  if (filterBy.labels && filterBy.labels.length) {
    const labelsToFilter = filterBy.labels.filter(l => l)
    toys = toys.filter(toy => labelsToFilter.every(label => toy.labels.includes(label)))
  }

  if (filterBy.maxPrice) {
    toys = toys.filter(toy => toy.price <= filterBy.maxPrice)
  }

  return toys
}

function _sortToys(toys, sortBy) {
  if (sortBy.name) {
    toys = toys.sort((t1, t2) => t1.name.localeCompare(t2.name) * sortBy.name)
  }

  if (sortBy.price) {
    toys = toys.sort((t1, t2) => (t1.price - t2.price) * sortBy.price)
  }

  if (sortBy.createdAt) {
    toys = toys.sort((t1, t2) => (t1.createdAt - t2.createdAt) * sortBy.createdAt)
  }

  return toys
}
