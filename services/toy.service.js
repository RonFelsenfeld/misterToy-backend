import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const ToyService = {
  query,
  getById,
  remove,
  save,
}

const toys = utilService.readJsonFile('data/toys.json')

function query(filterBy = {}) {
  let toysToReturn = toys.slice()

  if (filterBy.name) {
    const regExp = new RegExp(filterBy.name, 'i')
    toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
  }

  if (filterBy.inStock !== null) {
    switch (filterBy.inStock) {
      case true:
        toysToReturn = toysToReturn.filter(toy => toy.inStock)
        break

      case false:
        toysToReturn = toysToReturn.filter(toy => !toy.inStock)
        break
    }
  }

  return Promise.resolve(toysToReturn)
}

function getById(toyId) {
  const toy = toys.find(toy => toy._id === toyId)
  return Promise.resolve(car)
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
    toys.push(toy)
  }

  return _saveToysToFile().then(() => toy)
}

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
