---
title: 插件
date: 2018-02-14 23:43:00
categories: 基础
index: 6
---
# 插件
** Amaple **拥有非常强大插件功能，这也是它的突出功能之一，Amaple插件一般表现为功能块（函数）或功能块（包含一系列函数和属性的Object对象），它除了支持Amaple规范定义的插件外，还支持所有[** AMD **(点击了解详情)](https://github.com/amdjs/amdjs-api/wiki/AMD-%28%E4%B8%AD%E6%96%87%E7%89%88%29)和[** IIFE **(点击了解详情)](https://segmentfault.com/a/1190000003985390)规范的插件，在** rollup **、** webpack **、** browserify **等模块打包工具流行的今天，这也意味着几乎所有的第三方js库都可以与Amaple协同运作，同时也支持旧式的iife格式js库。
## 定义并安装Amaple规范的插件
在安装`Amaple`规范的插件前，我们需定义一个特定格式的`pluginDefinition`（插件定义对象）供`Amaple`安装，这个对象必须包含`name`属性和`build`函数，分别表示插件名与构建函数，此构建函数返回的值将作为插件实体。然后使用`am.install(pluginDefinition)`并传入插件安装对象`pluginDefinition`进行安装：
```javascript javascript
// 插件定义对象
const pluginDefinition = {
    name : "switch",   // 定义插件名，命名规则与变量名的规则相同

    // 构建函数，它要求返回一个插件实体
    // 无效返回值（undefined、null、0、false等）将会抛出错误
    // build函数中的this指向的是am对象，所以你可以使用它进行组件定义或am属性的扩展
    build : function () {
        var state = "OFF";

        return {
            press: function () {
                 return state === "OFF" ? "ON" : "OFF";
            }
        };
    }
};

// 调用后插件将会被安装，此时就完成了一个名为switch的插件
// 它是一个含有`press`函数的Object对象。
am.install (pluginDefinition);
```
在Amaple中，插件也可以像模块与组件文件一样编写在独立的js文件中，它也提供了相应的插件载入机制。如我们可将上面的插件定义代码单独放到`/plugin/switch.js`文件中。
## 载入插件
无论是** Amaple **规范、** amd **和** iife **规范的插件在Amaple中都可以以单独文件的形式存在，对于这些插件我们需要载入它们才可使用，我们可在`am.startRouter`函数的参数内添加`plugin`属性指定项目依赖的插件路径信息，这样Amaple将会自动加载这些插件文件，`plugin`具体配置如下：
```javascript javascript
am.startRouter( {
    // ...
    baseURL : {
        // ...

        // 可为插件文件设置base路径，所有的插件文件请求路径都将基于“/plugin”目录，不设置时默认为“/”
        plugin: "/plugin"
    },

    // plugin的值为一个数组，通过它来指定项目中依赖的所有插件
    // 以下分别表示插件载入的4种方式
    plugin: [

        // ①.插件路径字符串，适用于amaple规范的单独文件插件
        //   如上面定义的switch插件可使用此方式载入，加载路径依赖baseURL
        "siwtch",

        // ②.插件定义对象pluginDefinition，直接传入此对象后将会安装此插件
        //    与amaple规范的单独文件插件相比，不需调用am.install函数。
        //    这对于webpack等模块化环境下非常有用，你可以import任意js库并通过build函数retuen它进行安装
        { name: "switch", build: function () { ... } },

        // ③.amd规范js库，支持amd规范的所有js库都可以这样载入并作为amaple的插件使用
        //    url依赖baseURL，且url值为“http://”、“https://”开头时可直接载入外网js库
        { format: "amd", name: "anime", url: "amd/animejs" },

        // ④.iife规范js库，iife规范下将会使用global的值作为全局对象名，并在window对象下寻找它，未定义global时会使用name的值代替global值进行寻找
        //    url依赖baseURL，且url值为“http://”、“https://”开头时可直接载入外网js库
        { format: "iife", name: "lodash", global: "_", url: "iife/lodash" }
    ]
} );
```
> 虽然插件的载入是异步执行的，但请不必担心，它们会根据`plugin`数组按顺序进行安装，这对于拥有依赖的插件是很有用的，你可以在`plugin`属性中先载入被依赖的插件，这样，依赖它们的插件就可以顺利获取到它们了。

## 使用插件
被载入的插件可在模块、组件以及其他插件中使用，你可以在模块、组件的所有生命周期函数以及插件的`build`函数中直接通过插件名接收插件实体对象，这也是极为简单的，如在一个模块中使用** switch **插件：
```javascript javascript
new am.Module ( {

    // 使用插件名直接接收，switch插件将会自动注入到init、mounted函数中
    // 其他生命周期函数中也使用此方法注入对应插件实体
    init : function ( switch ) { ... },
    mounted : function ( switch ) { ... },
    // ...
} );
```
## 预定义插件
Amaple框架中有`util`、`http`、`event`、`promise`四个预定义插件，它们可以直接在生命周期函数中接收，而不需要在配置对象`plugin`属性中显式引入。
> 此小节主要介绍四个预定义插件的使用方法，但插件使用在Amaple中并不是必须的，所以如果你想更快看完此教程，可先跳过此小节的学习。

### \# 工具函数插件util
#### 类型：Object
#### 描述：
js工具函数集合
#### 对象属性：
##### **type(arg: any)**
- 类型：Function
- 描述：判断数据类型，与“typeof”关键字相比，它还可以判断null和Array两个数据类型
- 参数：
    - arg|any：需判断类型的数据
- 返回值：传入参数的数据类型
##### **foreach(target: ArrayLike|Object, callback: Function)**
- 类型：Function
- 描述：循环遍历一个对象，使用方法与array.forEach类似。但它还可以遍历类数组如Node.childNodes、Node.attributes等，且当传入的参数不可遍历时将直接返回。参数callback为循环遍历时的回调函数，它分别接收遍历项的值、遍历下表、遍历变量本身三个参数，当回调函数返回false时将break结束本次循环，而且此时foreach执行结束后也将会返回一个false，这在结束多层循环遍历时很有用，开发者可以通过“return foreach(...)”再次推出上层循环。
- 参数：
    - target|ArrayLike、Object：循环遍历的目标变量值
    - callback|Function：循环遍历时的回调函数，它分别接收遍历项的值、遍历下表、遍历变量本身三个参数，返回false可结束循环遍历
- 返回值：无
##### **isEmpty(object: Array|Object)**
- 类型：Function
- 描述：判断一个数组或对象是否为空，检查对象时它只会检查该对象本身的成员属性
- 参数：
    - object|Array、Object：待判断的数组会对象
- 返回值：空时为true，不空时为false
##### **isPlainObject (object: Object)**
- 类型：Function
- 描述：判断一个对象是否为纯粹的Object数据对象
- 参数：
    - object|Object：待判断对象
- 返回值：是则返回true，不是则返回false
##### **guid()**
- 类型：Function
- 描述：获取唯一标识
- 参数：无
- 返回值：唯一标识
### \# Ajax插件http
#### 类型：Object
#### 描述：
Ajax网络请求插件，它的对象函数`get`、`post`、`request`都实现了
 [**Promise/A+规范**](http://www.jb51.net/article/50725.htm)，在定义回调函数上，除了普通的异步回调函数传参外，还支持使用链式调用的方式来实现异步回调函数的调用，例如`http.get(...).done(function(result) {...}).fail(function(error){...})`或`http.get(...).then(function(result){}, function(error){...})`，来指定成功与失败的回调函数，如果在Promise对象上和回调函数传参上同时指定了回调函数，则会执行传参回调函数。成功回调函数`successHandler`将接收的参数为响应内容`response`、响应状态码`status`，响应状态内容`statusText`及自定义XHR对象`amXHR`，`amXHR`对象属性详细如下：
- **setRequestHeader(header: String, value: String)**
    - 描述：设置请求头，请求执行前设置有效
    - 参数：
        - header|String：请求头名称
        - value|String：请求头值
    - 返回值：无
- **getResponseHeader(header: String)**
    - 描述：获取返回头信息，请求响应后可获取
    - 参数：
        - header|String：返回头名称
    - 返回值：对应的返回头信息
- **getAllResponseHeaders()**
    - 描述：获取所有返回头信息，请求响应后可获取
    - 参数：无
    - 返回值：所有返回头信息
- **overrideMimeType(mimetype: String)**
    - 描述：设置mimeType，请求执行前设置有效
    - 参数：
        - mimetype|String：mimeType值
    - 返回值：无
- **abort(statusText: String)**
    - 描述：触发请求中断回调，在支持请求中断且请求响应前有效
    - 参数：
        - statusText|String：中断信息，开发者可在中断回调中的statusText获取到
    - 返回值：无
#### http插件对象函数：
##### get(url: String, args?: String|Object, callback?: Function, dataType?: String)
    - 类型：Function
    - 描述：执行Ajax GET请求，它将返回一个Promise对象用于以链式调用的方式来实现异步回调函数
    - 参数：
        - url|String：请求url
        - args?|String、Object：get提交的数据，此参数传入String时以“k1=v1&k2=v2”的格式传入，传入Object时为一个数据对象
        - callback?|Function：请求成功回调函数，。它
        - dataType?|String：设置响应内容的格式，可选为“TEXT/JSON/SCRIPT/JSONP”（可忽略大小写），默认为“TEXT”
    - 返回值：Promise对象
##### post(url: String, args?: String|Object, callback?: Function, dataType?: String)
    - 类型：Function

    - 描述：执行Ajax POST请求，它将返回一个Promise对象用于以链式调用的方式来实现异步回调函数
    - 参数：
        - url|String：请求url
        - args?|String、Object：post提交的数据，此参数传入String时以“k1=v1&k2=v2”的格式传入，传入Object时为一个数据对象
        - callback?|Function：请求成功回调函数，如果传入此参数则以它为回调函数执行。它将接收的参数为响应内容response、响应状态码status，响应状态内容statusText及自定义XHR对象amXHR
        - dataType?|String：设置响应内容的格式，可选为“TEXT/JSON/SCRIPT/JSONP”（可忽略大小写），默认为“TEXT”
    - 返回值：Promise对象
##### request(options: Object)
    - 类型：Function
    - 描述：执行Ajax请求，相比于get、post函数，它可以完成更复杂的请求操作，且此函数可直接在data属性中传入带有上传文件的form表单元素或FormData对象实现文件上传操作，当在低版本浏览器使用form表单元素上传时将自动使用隐藏iframe刷新的方式上传，但在支持FormData对象的浏览器中自动使用FormData对象实现文件上传
    - 参数：
        - options|Object：可选属性详情如下：
            - method?|String：请求类型，GET或POST，大小写不敏感，默认为GET
            - url|String： 请求地址
            - data?|String：提交的额外参数，可选为格式为k1=v1&k2=v2的字符串、{k1:v1, k2:v2}的数据对象、FormData对象及form表单元素对象，当data为form对象时，如果也提供了src参数则优先使用src参数当做url进行提交
            - async?|Boolean：是否异步请求，默认为true
            - cache?|Boolean：请求缓存，如果为false，则每次都会发送请求，默认为true
            - contentType|String：请求参数编码
            - dataType?|String：返回的数据类型，TEXT/JSON/SCRIPT/JSONP，大小写不敏感，默认为TEXT
            - username?|String：服务器认证用户名
            - password?|String：服务器认证密码
            - mimeType?|String：设置mimeType
            - headers?|Object：额外的请求头信息，为一个对象
            - timeout?|Number：请求超时时间
            - beforeSend?|Function：请求发送前回调，函数参数为amXHR对象、当前配置对象options
            - success?|Function：请求成功后回调，函数参数为data、statusText、amXHR对象
            - error?|Function：请求失败后回调，函数参数为amXHR对象、statusText
            - complete?|Function：请求完成后回调，函数参数为amXHR对象、statusText
            - abort?|Function：请求中断后回调，函数参数为statusText
    - 返回值：Promise对象
### \# 自定义事件插件event
#### 类型：Object
#### 描述：
自定义事件对象，支持跨模块触发事件
#### 对象函数：
##### on(types: String, listener: Function, once?: Boolean)
- 类型：Function
- 描述：绑定自定义事件，参数types以空格分隔开可同时绑定一个回调函数到多个事件类型上
- 参数：
    - types|String：自定义事件名称，使用空格隔开可同时绑定一个监听函数到多个事件类型上listener|Function：事件回调函数
    - once?|Boolean：是否只能触发一次，设置为true时，触发一次回调后将自动解除绑定
- 返回值：无
##### emit(types: String)
- 类型：Function
- 描述：触发自定义事件，当一个事件有多个回调函数时触发后将顺序执行多个回调函数
- 参数：
    - types|String：自定义事件名称，使用空格隔开可同时触发多个事件
- 返回值：无
##### remove(types: String, listener: Function)
- 类型：Function
- 描述：解绑事件，可一次解绑多个类型的事件
- 参数：
    - types|String：自定义事件名称，使用空格隔开可同时解绑多个事件
    - listener|Function：事件回调函数，必须与绑定事件时传入的回调函数相同才可成功解绑
- 返回值：无
### \# 异步操作同步化插件promise
#### 类型：Class
#### 描述：
[**Promise/A+规范**](http://www.jb51.net/article/50725.htm) 规范实现类，用于以同步的方式去执行回调函数，而不用将回调函数传入执行函数中，更加符合逻辑，且在需要执行多重回调处理时，以链式结构来表示函数处理后的回调。
#### 成员函数：
##### then(onFulfilled: Function, onRejected?: Function)
- 类型：Function
- 描述：指定成功与失败的回调函数，返回值为Promise对象，如果有多重异步回调则可以在此函数后继续链式调用来指定后续的异步回调函数
- 参数：
    - onFulfilled|Function：成功时的回调函数
    - onRejected?|Function：失败时的回调函数
- 返回值：Promise对象
##### done(onFulfilled: Function)
- 类型：Function
- 描述：指定成功的回调函数，相当于调用then函数只传入有效的成功回调
- 参数：
    - onFulfilled|Function：成功时的回调函数
- 返回值：Promise对象
##### fail(onRejected: Function)
- 类型：Function
- 描述：指定失败的回调函数，相当于调用then函数只传入有效的失败回调
- 参数：
    - onRejected|Function：失败时的回调函数
- 返回值：Promise对象
##### always(callback: Function)
- 类型：Function
- 描述：绑定执行完成的回调函数，无论执行函数成功与失败都将调用此方法绑定的回调函数
- 参数：
    - callback|Function：执行完成的回调函数
- 返回值：Promise对象