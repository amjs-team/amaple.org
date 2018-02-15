---
title: 模板指令与状态数据(state)
date: 2018-02-14 18:20:40
categories: 基础
index: 4
---
# 模板指令与状态数据(state)
一个模块的template模板、JavaScript和css之间的关系其实可以如下图表示：
{% asset_img module_connection.jpg %}

如果你了解Angular、Vue动态模板，那你将会对Amaple的模板感到很熟悉，在Amaple中，template模板也是基于模板指令和状态数据的动态模板引擎，当一个状态数据改变时，在template模板中与它绑定的dom元素将自动作出相应的更新，所以此时你只需关心模块内的状态数据，而不需去理会视图层的更新。
## 指令类型
指令分为动态指令和静态指令，动态指令的值会被当作JavaScript代码被解析，所以它们可以获取并绑定状态属性的值，如`:if`、`:for`等指令；而静态属性的值只会被当做普通的字符串处理，无法绑定状态属性，如`:module`和`:ref`指令。
## 使用插值表达式输出文本
我们直接先看看在`index.html`模板中使用插值表达式输出文本和属性，你应该会很快明白是怎么回事了：
```html html
<module>
    <template>
        <!-- 插值表达式由"{{}}"来表示 -->
        <!-- 插值表达式可在dom元素内和元素属性上进行状态数据的绑定 -->
        <span>{{ text }}</span>

        <!-- 插值表达式也可以多个插值表达式同时使用，或与固定字符串混合使用 -->
        <a href="{{ link }}?{{ search }}">direct to page about</a>
    </template>
    <script>

        // init函数将返回状态属性对象用于解析挂载模板数据
        new am.Module ( {
            init : function () {
                return {
                    text : "hello amaplejs,page index",
                    link : "/about",
                    search : "from=index"
                };
            },
            mounted : function () {
                
                // 通过this.state获取所有的状态属性
                this.state.text = "text has changed";
                // this.state.text被赋值后模板中“hello amaplejs,page index”也将自动更新为“text has changed”
                // 在queryUpdated、paramUpdated和unmount周期函数中也可以通过此方法来获取或赋值状态属性的值
            }
        } );
    </script>
    <style scoped>
        span { font-size: 20px; }
    </style>
</module>
```
> ①. `<template>`模板中的取值范围为当前模块的状态数据对象，在上面示例中，解析挂载时`{ { text } }`被替换为状态数据的`text`属性值；
②. 插值表达式的`{ { ... } }`将被作为JavaScript代码解析，如你可以这样写`{ { text === 1 ? "show" : "hidden" } }`，表示`text`属性值等于数字`1`时输出`"show"`，否则输出`"hidden"`。

### \# 插值表达式在style与class属性的特殊表现
插值表达式一般输出字符串（状态属性值不为字符串时将会调用该值的`toString`函数），但在`style`属性上使用插值表达式时会将一个object对象转换为内联样式的格式，在`class`属性上使用时会将一个`array`数组转换为以空格隔开的字符串：
```html html
<template>
    <div class="{{ clsList }}" style="{{ styleObj }}"><div>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                
                // 在class属性使用插值表达式输出时自动转换为"cls1 cls2"
                clsList: [ "cls1", "cls2" ],

                // 在style属性使用插值表达式输出时自动转换为"background:red;font-size:20px"
                // 注意两点：
                // ①.使用驼峰式来定义css属性名，如fontSize，在输出时将自动转换为font-size
                // ②.为css属性名赋值为一个量值时可直接写为数字，如fontSize: 20，它将自动补充“px”单位
                styleObj: {
                    background: "red",
                    fontSize: 20
                }
            };
        },
    } );
</script>
```
## 循环渲染输出dom元素
在实际项目中，经常会遇到根据数据库的数据来渲染一个列表的需求，如用户列表、使用表格展示数据等，此时我们就需要使用模板指令`:for`来完成需求：
```html html
<template>
    <ul>
        <!-- :for指令中只能使用两种特定语法 -->
        <!-- 第一种为“item in list”，item为list循环时的每一项值，它是一个局部变量，只能在:for属性所在的元素上及内部使用 -->
        <!-- 有时候我们需要获取遍历时的索引，此时你可以这样写“(item, i) in list”，这样就可以在:for属性所在的元素上及内部使用“i”变量了 -->
        <li :for="item in list">{{ item }}</li>
    </ul>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                list: [ "apple", "orange", "grape" ]
            };
        },
        mounted : function () {

            // 我们可以调用数组的相关变异函数，在模板中绑定了此数组的地方也将作出相应更新，如下
            this.state.list.push ( "peach" );
            // 其他可用的变异函数还有push、pop、sort、shift、unshift、splice、reverse
        }
    } );
</script>
```
### \# 在`<template>`上使用`:for`
你可以在`<template>`上使用`:for`来循环渲染多个dom元素：
```html html
<template>
    <div>
        <template :for="i in names">
            <span>list.firstName</span>
            <span>list.lastName</span>
        </template>
    </div>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                names: [
                    {firstName: "George", lastName: "Bush"},
                    {firstName: "Jake", lastName: "Wood"}
                ]
            };
        },
    } );
</script>
```
它将被渲染为：
```html html
<div>
    <!-- <template>标签自动被去除 -->
    <span>George</span>
    <span>Bush</span>
    <span>Jake</span>
    <span>Wood</span>
</div>
```

### \# 使用`:for`指令遍历字符串
当`:for`指令遍历字符串时，item值为字符串每个字符：
```html html
<div>
    <strong>Amaple由</strong>
    <span :for="char in 'Amaple'">[{{ char }}]</span>
    <strong>组成</strong>
</div>
<!-- 渲染后的文字为：Amaple由[A][m][a][p][l][e]组成 -->
```

### \# 使用`:for`指令遍历数字
当`:for`指令遍历数字时，item值为从0开始累加的索引数字：
```html html
<div>
    <strong>小于5的非负数有</strong>
    <span :for="num in 5">[{% raw %}{{<span> <span>num }}{% endraw %}]</span>
</div>
<!-- 渲染后的文字为：小于5的非负数有[0][1][2][3][4] -->
```

> 使用状态数组应该避免直接通过索引操作，如`this.state.list [ 0 ] = "banana"`将不会触发自动更新。

## 通过条件判断显示与隐藏元素
我们经常需要通过条件判断来确定应该显示哪一部分的内容，以简单的用户登录为例，当有用户信息时显示信息，没有时显示登录按钮，此时可以使用模板指令的`:if`、`:else-if`、`:else`，它与我们熟知的`if`、`else if`及`else`关键字的用法相同：

```html html
<template>
    <div :if="userInfo">
        <img src="{{ userInfo.avatar }}" />
        <span>{{ userInfo.username }}</span>
    </div>
    <div :else>
        <a href="login.action">您还没有登录，点击登录</a>
    </div>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                userInfo : null
            };
        },
        mounted : function () {
            this.state.userInfo = { username: "Tom", avatar: "tom_101101.jpg" };
        }
    } );
</script>
```
当初始化时`module.state.userInfo=null`，它将被渲染为：

```html html
<div>
     <a href="login.action">您还没有登录，点击登录</a>
</div>
```

当`mounted`钩子函数触发后`module.state.userInfo={ username: "Tom", avatar: "tom_101101.jpg" }`，它将被渲染为：
```html html
<div>
     <img src="tom_101101.jpg" />
     <span>Tom</span>
</div>
```
### \# 在`<template>`上使用条件判断
它将`<template>`的子元素作为一个整体进行条件判断，并在渲染的时候去掉`<template>`父元素。

```html html
<template>
    <div>
        <template :if="show === true">
            <span>content1</span>
            <span>content2</span>
        </template>
        <template :else-if="show === false">
            <span>content3</span>
            <span>content4</span>
        </template>
        <div>
            <span>content5</span>
        </div>
    </div>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                show: true
            };
        },
    } );
</script>
```

当`module.state.show=true`时将被渲染为：

```html html
<div>
    <span>content1</span>
    <span>content2</span>
</div>
```

当module.state.show=false时将被渲染为：

```html html
<div>
    <span>content3</span>
    <span>content4</span>
</div>
```

当module.state.show=1时将被渲染为：

```html html
<div>
    <div>
        <span>content5</span>
    </div>
</div>
```
### \# `:for`和`:if`在同一个元素上使用
`:for`指令的解析优先级高于`:if`，这意味着所有循环渲染的元素都会判断`:if`的条件。

```html html
<template>
    <ul>
        <li :for="item in list" :if="item !== 'apple'">{{ item }}</li>
    </ul>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                list: [ "apple", "orange", "grape" ]
            };
        },
    } );
</script>
```
它将被渲染为：
```html html
<ul>
    <li>orange</li>
    <li>grape</li>
</ul>
```
> 带有`:else-if`或`:else`属性元素的上一个兄弟元素必须使用了`:if`或`:else-if`指令，且`:else`属性是没有值的

## 模块函数与事件绑定
在状态数据对象上定义的函数叫做模块函数，我们在子模块主动向父模块传值时提到过它。除了传值的作用外，模块函数还可当做事件绑定函数来使用，如下面事件绑定的示例，在`<button>`上使用`:on`指令声明`click`事件并指定回调函数。
```html html
<template>

    <!-- :on指令的用法是在它的后面补充上事件名称，如:onclick、:onchange等 -->
    <!-- 使用这个指令绑定事件共有三种形式 -->
    <!-- ①.直接指定一个模块函数作为事件回调函数 -->
    <button :onclick="clickHandler">BTN1</button>

    <!-- ②.在指定一个模块函数为事件回调函数的同时传递参数到此模块函数内 -->
    <button :onclick="clickHandler ( 'a', 111 )">BTN2</button>

    <!-- ③.当你认为你的事件处理函数很简单，并且不会在其他地方重用时，那你也可以直接将JavaScript代码写到:on指令的值中 -->
    <button :onclick="var text = 'BTN2 has clicked!'; alert(text);">BTN3</button>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {

                // 需注意的是，作为事件绑定的模块函数的第一个参数永远为event对象，而在额外传入的参数在模块函数中第二个开始接收
                // 在第②种形式中传入了字符串"a"和数字111到模块函数中，模块函数在第二个开始接收，即str的值为"a"，num为111
                clickHandler: function ( event, str, num ) { ... }
            };
        }
    } );
</script>
```
> 模块函数内的`this`指针指向当前模块的状态数据对象（即`module.state`对象），它也不可使用ES6的箭头函数（Arrow function），因为这样会导致函数内`this`指针指向不正确而出错。

## 计算属性
假如项目的某个模块中定义了两个状态属性，分别为产品品牌brand、产品型号model，此时你需要在模板中输出品牌与型号的组合，此时你可能会这样写：
```html html
<template>
    <span>{{ brand }} {{ model }}</span>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                brand : "Samsung",
                model : "Note8"
            };
        }
    } );
</script>
```
这没有任何问题，但当有多处都需输出同样信息时，使用多个差值表达式就显得有点麻烦，所以对于如需要多次拼接字符串或其他任何较为复杂处理的输出，应该使用计算属性来实现，像这样：
```html html
<template>
    <span>{{ productName }}</span>
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                brand: "Samsung",
                model: "Note8",

                // 在状态数据对象中指定computed属性，它的值为一个对象，此对象内的所有属性都将被转换为计算属性
                computed: {

                    // 这里定义了一个计算属性productName，它分别有get和set函数
                    // 框架在初始化计算属性时将会调用get函数获取并缓存此计算属性的值，而获取this.state.productName的值时都将会返回缓存的值
                    // 当为this.state.productName赋值时，则会调用此计算属性的set函数并接收一个新值
                    // 从该计算属性productName的get函数可看出，它依赖于状态数据brand和model，所以当brand或model的值更新时，此计算属性的缓存值也会更新
                    productName: {
                        get: function () {
                            return this.brand + " " + this.model;
                        },
                        set: function ( val ) {
                            var split = val.split ( " " );
                            this.brand = split [ 0 ];
                            this.model = split [ 1 ];
                        }
                    }
                    
                    // 一个计算属性可以只设置get函数，你可以像上面那样直接去掉set函数，也可以直接将此计算属性定义为一个函数作为get函数，像这样
                    // productName: function () { return this.brand + " " + this.model; }
                }
            };
        }
    } );
</script>
```
## 表单的双向绑定
在表单元素上使用`:model`指令即可实现表单输入值与状态属性的双向绑定，如下：
```html html
<template>
    <!-- 当此input输入框的value值改变时，状态属性username的值也将自动同步更新 -->
    <input type="text" name="username" :model="username" />
</template>
<script>
    new am.Module ( {
        init : function () {
            return {
                
                // 当此状态属性的值改变时，上面的input输入框的value值也将同步更新
                username: ""
            };
        }
    } );
</script>
```

> 可使用model指令的表单元素有type为任何值的`input`、`textarea`和`select`。

### \# `:model`指令在`checkbox`上使用
`checkbox`绑定的状态属性值必须为`Array`类型，且当多个`checkbox`绑定同一个状态属性时，被选中`checkbox`的值将会保存在此数组中。
### \# `:model`指令在`radio`上使用
`radio`元素没有设置`name`属性时，自动设置绑定的状态属性名为`name`属性。

> 以上所有指令为动态指令，接下来的是静态指令

## 设置当前页面显示的标题
当url跳转更新模块时，我们希望标题随模块改变，此时我们可使用`:title`指令来设置标题，它只能用于一个模块的`<module>`元素上，像这样：
```html html
<module :title="hello amaplejs">
    <template>...</template>
    <script>...</script>
    <style>...</style>
</module>
```

> 当然很多时候一个页面将同时加载多个不同层级的模块，此时框架将会从上到下、从外到内的顺序解析并更新模块，当以这样的顺序解析时将会获取第一个`:title`不为空的标题作为更新标题，而会自动忽略后面模块所定义的标题，所以建议标题应该在最外层的主模块中定义。

## 引用元素
有时候必须操作dom元素如聚焦`input`元素，我们必须获取此`input`元素的对象并调用`input.focus`函数，这时可以在此`input`元素上使用`:ref`指令定义一个引用，然后调用`am.Module`对象的成员函数`refs( refName )`获取被引用的dom元素：

```html html
<template>
     <input type="text" :ref="ref_dom" />
</template>
<script>
    new am.Module ( {
        init : function () { ... },
        mounted : function () {

            // 这样就获取到了模板中的input元素并聚焦
            this.refs ( "ref_dom" ).focus ();
            // refs函数不能在init生命周期函数中使用，因为init函数被调用时还未解析模板
        }
    } );
</script>
```
> 当多个元素的`:ref`值设置同一个引用名时，使用`refs`函数获取该引用名的dom元素时将会返回一个包含所有该引用名的元素数组。