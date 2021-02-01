# Promise
> my promise

## promise/A+
[promise/A+](https://promisesaplus.com/)
### 术语
1. promise: 是一个拥有then方法的对象或函数，其行为符合本规范
2. thenable: 是一个定义了then方法的对象或函数,这个主要用来兼容一些老的Promise实现，只要一个Promise实现是thenable,也就是拥有then方法的，就可以跟Promise/A+兼容。
3. value: 只resolve出来的值，可以是任意合法的JS的值(包括undefined,thenable和promise等)
4. exception: 异常，在Promise里面用throw抛出来的值
5. reason: 拒绝原因，是reject里面传的参数，表示reject的原因

### Promise状态
Promise总共有三种状态：
1. pending: 一个promise在被resolve或者reject前就处于这个状态
2. fulfilled: 一个promise被resolved后就处于fulfilled状态，这个状态不能再改变，而且必须拥有一个不可变的值(value).
3. rejected: 一个promise被reject后就处于rejected状态，这个状态不能再改变，而且必须拥有一个不可变的拒绝原因(reason)

### then方法
一个promise必须拥有一个then方法来访问他的值或者拒绝原因。then方法有两个参数
`promise.then(onFulfilled, onRejected)`
#### 参数可选
`onFulfilled`和`onRejeced`都是可选参数。
- 如果`onFulfilled`不是函数，其必须被忽略
- 如果`onRejected`不是函数，其必须被忽略
#### `onFulfilled`特性
如果`onFulfilled`是函数：
- 当`promise`执行结束后其必须被调用，其第一个参数为`promise`的终值`value`
- 在`promise`执行结束前其不可被调用
- 其调用次数不可超过一次

#### `onRejected`特性
如果 `onRejected`是函数：
- 当`promise`被拒绝执行后期必须被调用，其第一个参数为`promise`的拒因`reason`
- 在`promise`被拒绝执行前不可被调用
- 其调用次数不可超过一次

#### 多次调用
`then`方法可以被同一个`promise`调用多次
- 当`promise`成功执行时，所有`onFulfilled`需按照其注册顺序依次回调
- 当`promise`被拒绝执行时，所有的`onRejected`需按照其注册顺序依次回调

#### 返回
`then`方法必须返回一个promise对象
```
  promise2 = promise1.then(onFulfilled, onRejected);
```
- 如果`onFulfilled`或者`onRejected`返回一个值x,则运行`promise`解决过程`[[Resolve]](promise2, x)`
- 如果`onFulfilled`或者`onRejected`抛出一个异常`e`,则`promise`必须拒绝执行，并返回拒因`e`
- 如果`onFulfulled`不是函数且`promise1`成功执行，`promise2`必须成功执行并返回相同的值
- 如果`onRejected`不是函数且`promise`拒绝执行，`promise2`必须拒绝并返回相同的拒因。


## test
测试[promise/A+](https://github.com/promises-aplus/promises-tests)