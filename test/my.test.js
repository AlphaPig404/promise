var Promise = require('../src/MyPromise2')

var expect = require('chai').expect

describe('test basic', function(){
  it('test then', function(){
    var promise = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('ok')
      },100)
    })

    promise.then(function(res){
      expect(res).to.be.equal('ok')
    },function(reason){
      connsole.log(reason)
    })
  })

  it('a', function(){
    new Promise(resolve=>resolve(8))
    .then()
    .then()
    .then(function foo(value) {
      expect(value).to.be.equal(8)
    })
  })
})