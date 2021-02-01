const { resolve } = require("./mypromise")

var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

function MyPromise(fn){
  this.state = PENDING
  this.value = null
  this.reason = null
  this.onFulfilledCallbacks = []
  this.onRejectedCallbacks = []

  var self = this

  function resolve(value){
    setTimeout(function(){
      if(self.state === PENDING){
        self.state = FULFILLED
        self.value = value
        self.onFulfilledCallbacks.forEach(function(callback){
          callback(self.value)
        })
      }
    },0)
  }

  function reject(reason){
    setTimeout(function(){
      if(self.state === PENDING){
        self.state = REJECTED
        self.reason = reason
        self.onRejectedCallbacks.forEach(function(callback){
          callback(self.reason)
        })
      }
    },0)
  }

  try{
    fn(resolve, reject)
  }catch(error){
    reject(error)
  }
}

function resolvePromise(promise, x, resolve, reject){
  // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if(promise === x){
    return reject(new TypeError('The promise and the return value are the same'))
  }
  // 2.3.2 If x is a promise
  if(x instanceof MyPromise){
    // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
    if(x.state === PENDING){
      x.then(function(y){
        resolvePromise(promise, y, resolve, reject)
      }, reject)
    }else if(x.state === FULFILLED){
      // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
      resolve(x.value)
    }else if(x.state === REJECTED){
      // 2.3.2.3 If/when x is rejected, reject promise with the same reason.
      reject(x.reason)
    }
  }else if(typeof x === 'object' || typeof x === 'function') {
    if(x === null){
      resolve(x)
    }
    // 2.3.3 Otherwise, if x is an object or function
    try{
      // 2.3.3.1 Let then be x.then
      var then = x.then
    }catch(error){
      // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
      reject(error);
    }
    // 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
    if(typeof then === 'function'){
      var called = false 

      try{
        then.call(x, 
          function(y){
            // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
            if(called) return // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            called = true 
            resolvePromise(promise, y, resolve, reject)
          },
          function(r){
            // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
            if(called) return 
            called = true 
            reject(r)
          }
        )
      }catch(error){ // 2.3.3.3.4 If calling then throws an exception e
        if(called) return // 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
        reject(error) // 2.3.3.3.4.2 Otherwise, reject promise with e as the reason.
      }
    }else{
      //2.3.3.4 If then is not a function, fulfill promise with x.
      resolve(x)
    }
  }else{
    // 2.3.4 If x is not an object or function, fulfill promise with x.
    resolve(x)
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected){
  var self = this
  var realOnFulfilled = onFulfilled
  var realOnRejected = onRejected
  if(typeof onFulfilled !== 'function'){
    realOnFulfilled = function(value){
      return value
    }
  }
  if(typeof onRejected !== 'function'){
    realOnRejected = function(error){
      if(error instanceof Error){
        throw error
      }else{
        throw new Error(error)
      }
    }
  }

  if(this.state === FULFILLED){
    var promise2 = new MyPromise(function(resolve, reject){
      setTimeout(function(){
        try{
          if(typeof onFulfilled !== 'function'){
            resolve(self.value)
          }else{
            var x = realOnFulfilled(self.value)
            resolvePromise(promise2, x, resolve, reject)
          } 
        }catch(error){
          reject(error)
        }
      },0)
    })
    return promise2
  }

  if(this.state === REJECTED){
    var promise2 = new MyPromise(function(resolve, reject){
      setTimeout(function(){
        try{
          if(typeof onRejected !== 'function'){
            reject(self.reason)
          }else{
            var x = realOnRejected(self.reason)
            resolvePromise(promise2, x, resolve, reject)
          }
        }catch(error){
          reject(error)
        }
      },0)
    })
    return promise2
  }
  // 异步
  if(this.state === PENDING){
    var promise2 = new MyPromise(function(resolve, reject){
      self.onFulfilledCallbacks.push(function(){
        try{
          if(typeof onFulfilled !== 'function'){
            resolve(self.value)
          }else{
            var x = realOnFulfilled(self.value)
            resolvePromise(promise2, x, resolve, reject)
          } 
        }catch(error){
          reject(error)
        }
      })
      self.onRejectedCallbacks.push(function(){
        try{
          if(typeof onRejected !== 'function'){
            reject(self.reason)
          }else{
            var x = realOnRejected(self.reason)
            resolvePromise(promise2, x, resolve, reject)
          }
        }catch(error){
          reject(error)
        }
      })
    })

    return promise2
  }
}


MyPromise.deferred = function() {
  var result = {};
  result.promise = new MyPromise(function(resolve, reject){
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}

MyPromise.resolve = function(parameter){
  if(parameter instanceof MyPromise){
    return parameter
  }
  return new MyPromise(function(resolve){
    resolve(parameter)
  })
}

MyPromise.reject = function(reason){
  return new MyPromise(function(resolve, reject){
    reject(reason)
  })
}

MyPromise.all = function(promiseList){
  return new MyPromise(function(resolve, reject){
    var count = 0;
    var length = promiseList.length 
    var result = []

    if(length === 0){
      resolve(result)
    }

    promiseList.forEach(function(promise){
      MyPromise.resolve(promise).then(function(value){
        count++
        result.push(value)
        if(count === length){
          resolve(result)
        }
      }, function(err){
        reject(err)
      })
    })
  })
}


MyPromise.race = function(promiseList){
  return new MyPromise(function(resolve, reject){
    var length = promiseList.length
    if(length === 0){
      resolve()
    }
    for(var i = 0; i < length; i++ ){
      MyPromise.resolve(promiseList[i]).then(function(res){
        resolve(res)
        return
      },function(err){
        reject(err)
        return
      })
    }
  })
}

MyPromise.prototype.catch = function(onReject){
  this.then(null, onReject)
}

MyPromise.prototype.finally = function(fn){
  return this.then(function(value){
    return MyPromise.resolve(fn()).then(function(){
      return value
    })
  }, function(reason){
    return MyPromise.resolve(fn()).then(function(){
      throw reason
    })
  })
}

MyPromise.allSettled = function(promiseList){
  return new MyPromise(function(resolve, reject){
    var length = promiseList.length
    var count = 0 
    var result = []

    if(length === 0){
      resolve(result)
    }else{
      for(var i = 0; i < length; i++){
        (function(i){
          var currentPromise = promiseList[i]
  
          currentPromise.then(function(value){
            count ++ 
            result[i] = {
              status: 'fulfilled',
              value: value
            }
  
            if(count === length){
              resolve(result)
            }
          }, function(reason){
            count ++ 
            result[i] = {
              status: 'rejected',
              reason: reason
            }
            if(count === length){
              resolve(result)
            }
          })
        }(i))
      }
    }
  })
}


module.exports = MyPromise