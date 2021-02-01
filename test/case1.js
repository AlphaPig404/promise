const Promise = require('../index')

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 100)
  reject('err')
})

p.then((value) => {
  console.log(value)
  return {x: 2}
}).then(value => {
  console.log(value)
}).catch(err => {
  console.log(err)
})

p.then((value) => {
  console.log(value)
  return {x: 2}
}, (error) => {
  console.log(error)
  return 'hah'
}).then(value => {
  console.log(value)
}).catch(err => {
  console.log(err)
})
