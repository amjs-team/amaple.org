---
title: 组件
date: 2018-02-14 18:44:36
categories: 基础
index: 5
---
# 组件
在Amaple单页应用中，一个页面其实存在两种模块化单位，分别是
1. ** 模块 **（`am.Module`类），它是以web单页应用跳转更新为最小单位所拆分的独立块；
2. ** 组件 **（`am.Component`类），它的定位是拥有特定功能的封装块，就像由一堆代码封装成的具有特定功能的函数一样，一个组件也有独立的视图、状态数据对象、组件行为以及生命周期。常用的组件有`Dialog`、`Bubble`、`Navigator`和`Menubar`等。

## 在模块中定义并使用一个简单的组件衍生类
使用`am.class`类构造器继承`am.Component`类定义一个组件，而继承`am.Component`创建的类被称为** 组件衍生类 **，你可以这样定义一个组件衍生类：

```javascript javascript
// 在am.class函数的参数中指定该组件衍生类的类名，它返回指定名称的组件衍生类
// 类名须遵循首字母大写的驼峰式命名规范，如"BubbleDemo"，否则将会报错。但接收变量名没有限制
var BubbleDemo = am.class ( "BubbleDemo" ).extends ( am.Component ) ( {

    // 在init函数返回该组件的状态数据对象
    init : function () {
        return {
            bubbleText: "this is a component bubble"
        };
    },

    // 组件中必须定义render函数，在该函数中指定组件的template模板和样式
    render : function () {
        this.template ( "<span>{{ bubbleText }}</span>" )
        .style ( {
            span: { background: "red", fontSize: 20, padding: "10px 16px" }
            // !注意：当元素选择器为符合变量命名规则时可不用引号，如上面选择span元素时。当选择器不符合变量名规则时需使用引号，如：
            // ".class-name": { fontSize: 15 }
            // "span #id": { margin-top: 24 }
        } );
        // this.template ( templateHTML )函数中传入html字符串来定义该组件的视图
        // this.style ( styleObj )函数为该组件的视图定义样式，这些样式也只作用于组件视图
        // 需注意的是该函数传入一个对象，对象属性名为css选择器语法，值为css样式对象，样式名也是使用驼峰式表示，样式值为量值时可直接写为数字
    }
} );
```
在一个模块中使用** 组件衍生类 **渲染组件视图也是非常简单的，首先在`am.startRouter`函数中配置组件加载的`baseURL`：
```javascript javascript
am.startRouter ( {
    baseURL : {
        // ...

        // 为组件文件设置base路径，所有的组件文件请求路径都将基于“/component”目录，不设置时默认“/”
        component: "/component"
    },
    // ...
} );
```
然后在需要使用的模块或组件中通过`import`函数引入，并在`<template>`中通过自动以标签名来使用组件
```html html
<template>
    <!-- 自定义标签名为该组件衍生类的类名以全部小写的中划线式规范转换而来，而不是接收的变量名的转换 -->
    <bubble-demo></bubble-demo>
</template>
<script>

    // 当你将上面的组件衍生类单独编写在src/component文件里时，你需要使用“import ( componentFilePath )”来引入此组件，
    // 这样在template模板中的<bubble-demo>元素就会解析为组件模板“<span>this is a component bubble</span>”了。
    // 引入时可省略“.js”文件后缀
    var BubbleDemo = import ( "BubbleDemo" );

    // 当然你也可以直接在模块中编写使用一个组件，像这样：
    // var BubbleDemo = am.class ( "BubbleDemo" ).extends ( am.Component ) ( ... );
    new am.Module ( {
        init : function () { ... }
    } );
</script>
```
## 组件生命周期
与模块生命周期阶段数一样，一个组件从创建到卸载也分为5个阶段的生命周期，具体如下：
- `init`：组件初始化时触发，它返回组件`<template>`模板解析与挂载所使用的状态数据。`init`函数内可调用`this.propsType`函数进行`props`参数验证。
> props相关知识将在本章节的后面部分介绍
- `render`：渲染组件视图时触发，该生命周期函数内可分别调用`this.template`函数定义视图标签的字符串，和`this.style`函数为组件视图添加样式
- `mounted`：解析并挂载状态数据到组件视图后触发，你可以在此函数中处理一些视图解析完成后的操作，如为此组件请求网络数据并更新到模板等
- `updated`：当组件在页面中的位置改变时触发，在组件上使用`:for`指令时将会渲染多个组件，此时改变`:for`指令所绑定的状态数组时将可能改变组件的位置
- `unmount`：组件卸载时触发，有两种情况将会卸载组件：
    ①. 通过`:for`指令渲染多个组件视图后，调用绑定的状态数组的变异函数都可能在页面上卸载一个或多个组件；
    ②. 当一个模块或组件被卸载时，该模块或组件中的组件也将会卸载。
## 组件行为
我们已经知道组件是一个拥有特定功能的封装块，所以它会有自己特定的** 组件行为 **，如`Dialog`组件有打开和关闭行为，轮播图组件有翻页行为等。你可以这样定义** 组件行为 **：
```javascript javascript
var Dialog = am.class ( "Dialog" ).extends ( am.Component ) ( {
    init : function () {
        return { open: false, text: "" };
    },
    render : function () {
        this.template ( [
            '<div :if="open">',
                '<span>{{ text }}</span>',
            '</div>'
        ].join ( "" ) );
    },

    // 添加action成员函数，该函数返回组件行为的函数集合对象，该对象被称为组件行为对象
    // action函数的this指针也是指向该组件对象本身
    action : function () {
        var _this = this;
        return {

            // 组件行为函数的this指针不会指向任何值
            // 通过state.open来控制Dialog视图的隐藏与显示
            open: function ( text ) {
                _this.state.text = text;
                _this.state.open = true;
            },
            close: function () {
                _this.state.open = false;
            }
        };
    }
} );
```
### \# 组件行为的两种使用方法
- [1]在组件的生命周期函数`mounted`、`update`和`unmount`中可通过`this.action`使用组件行为对象；
- [2]在组件元素上使用`:ref`指令，调用`module.refs`函数获取组件引用时将返回该组件的组件行为对象。
## 嵌套组件
组件与组件之间配合使用可以发挥更强大的组件能力，在一个组件的`<template>`模板中可以嵌套其他组件，你可以这样写：
```javascript javascript
// ComponentB组件依赖ComponentA组件
// ComponentA组件的编写与普通组件编写相同，这里省略
var CompoenntB = am.class ( "CompoenntB" ).extends ( am.Component ) ( {

    // 在构造函数中通过this.depComponents来指定该组件的依赖组件数组
    constructor : function () {
    
        // 和ES6的class关键字定义类一样，在构造函数中需首先调用super()函数，否则将会抛出错误
        this.__super ();
        this.depComponents = [ ComponentA ];
    },
    init : function () { ... },
    render : function () {
        this.template ( "<component-a></component-a>" );
    }
} );
```
当`ComponentA`和`ComponentB`组件都编写在单独的文件中时，你需要在模块中同时引入** 组件 **及** 嵌套组件 **，像这样：
```html html
<template>...</template>
<script>

    // 在ComponentB组件中只需通过this.depComponents = [ ComponentA ]指定它所依赖的组件即可，然后在使用的模块中统一引入这些组件文件
    // 因为ComponentB组件依赖ComponentA组件，所以需在ComponentB之前引入ComponentA
    // 此时ComponentA组件就可以被ComponentB所获取到
    var ComponentA = import ( "component/ComponentA" );
    var ComponentB = import ( "component/ComponentB" );

    new am.Module ( ... );
</script>
```
## 组件与组件、组件与模块之间的通信
组件作为一个单独的封装块，它必须与其他组件或模块进行通信，你可以在模块中分发数据到不同组件，也可以在组件中分发数据到嵌套组件中。在组件中可以使用`props`进行数据的通信，使用`subElements`进行html模板块分发。
### \# 使用`props`传递静态值
```html html
<template>
    <!-- 在组件元素上定义任何非指令属性（属性名不为“:”开头），它都会被当做props属性传入组件中 -->
    <dialog text="this is a external message!"></dialog>
</template>
<script>
    am.class ( "Dialog" ).extends ( am.Component ) ( {
        init : function () {

            // 在组件中使用this.props接收外部传入的数据
            // this.props.text的值为"this is a external message!"，即外部传入的字符串
            return { text: this.props.text };
        },
        // ...
    } );

    new am.Module ( ... );
</script>
```
### \# 使用`props`传递动态值
`props`还支持使用插值表达式的方式传递状态数据，这被称为** 动态`props` **。动态`props`将创建一个对外部状态数据的代理属性，当在组件内更改了此代理属性时，外部对应的状态数据也将同步更新。如下：
- 在使用`Dialog`组件的视图中，将状态属性`text`传入组件后，组件的`this.props.text`即为该状态属性的代理属性。
```html html
<template>
    <dialog text="{{ text }}"></dialog>
</template>
<script>
    new am.Module ( {
        init : function () {
            text: "this is a external message!"
        },
        // ...
   } );
</script>
```
- 在`Dialog`组件的代码中，可通过`this.props.text`获取外部传递的`text`状态属性。
```javascript javascript
am.class ( "Dialog" ).extends ( am.Component ) ( {
    init : function () {
        return {

            // 使用text1接收并使用this.props.text的值
            text1: this.props.text,

            // 如果你希望更新外部的text属性后，组件视图中挂载了this.props.text数据的地方也同步更新，
            // 你可以在组件中创建一个计算属性作为this.props.text的代理，如下创建的text2计算属性：
            computed: {
                var _this = this;
                text2: {
                    get: function () {
                        return _this.props.text;
                    },
                    set: function ( newVal ) {
                        _this.props.text = newVal;
                    }
                }
                // 因为组件内对this.props.text的值更新后，外部的text状态属性也会同步更新，反之也成立
                // 这样在组件视图中挂载text2就等于挂载props.text
                // 此时需注意的是，更改text2的值也将同步更改外部text属性的值
            }
        };
    },
    // ...
} );
```
### \# props验证
当你希望开放你所编写的组件给其他开发者使用时，你不确定其他开发者传入的`props`参数是否符合组件内的处理要求，此时你可以为你的组件设置`props`数据验证，你可以在组件的`init`函数内调用`this.propsType`函数进行验证：
```javascript javascript
am.class ( "Dialog" ).extends ( am.Component ) ( {
    init : function () {

        // 每项值的验证都可以设置validate、require和default属性
        this.propsType ( {
            text: {
                validate: String,  // 表示当传入text值时它必须为字符串
                require: true,  // 表示text参数为必须传入的参数，默认为false
                default: "Have no message"   // 表示不传入text参数时的默认值，默认值不会参与props验证，不指定default时无默认值
                // validate的值可以有四种类型的参数，分别为：
                // ①. 基础数据构造函数，分别有String、Number、Boolean三种基本数据类型构造函数，Function、Object、Array三种引用类型构造函数，
                //     以及undefined和null，它表示允许传入的数据类型
                // ②. 正则表达式，如/^1\d{10}$/表示只允许传入一个手机号码
                // ③. 函数，它接收此props参数值，必须返回true或false表示是否通过验证，如：
                // function ( text ) { return text.length > 5 }
                // ④. 数组，数组内是以上三种值的组合，通过数组内任意一项验证都可以通过，相当于“||”运算符

            }

            // 当text属性验证只要设置validate属性时，可直接如下缩写：
            // text: String
        } );

        return { text: this.props.text };
    },
    // ...
} );
```
## 使用`subElements`分发html片段
如果你想开发一个更加通用的`Dialog`组件，你应该不希望`Dialog`的视图布局是固定不变的，而是可以根据不同的需求自定义`Dialog`视图，因为这样才显得更加灵活多变，组件的`subElements`就是用来解决这个问题的，它可以使你从组件外部传入html片段与组件视图混合：
```html html
<dialog>
    <!-- <span>的内容会被作为html片段传入组件内 -->
    <span>this is external HTML template</span>
</dialog>
```
然后在组件内通过subElements属性获取外部传递的视图，并插入到组件视图中的任意位置。subElement接收的视图可分为** 默认subElements **、** subElements的单数分块 **和** subElements的不定数分块 **三种形式。
### \# 默认subElements
在组件元素中传入html片段时，组件内将会创建一个默认的`subElements`局部变量，你可以在组件内的模板中通过`{{ subElements.default }}`插入此html片段：
```javascript javascript
am.class ( "Dialog" ).extends ( am.Component ) ( {
    init : function () { ... },
    render : function () {

        // {{ subElements.default }}将会输出外部传入的“<span>this is external HTML template</span>”
        this.template ( "<div>{{ subElements.default }}</div>" );
    }
    // ...
} );
```
`Dialog`组件将会被渲染成：
```html html
<div>
    <span>this is external HTML template</span>
</div>
```
> 分发的html片段也可以使用模板指令与组件，此html片段解析时挂载的数据来源是组件外部的状态数据，如下：
```html html
<template>
     <dialog>
          <!-- {{ text }}的数据来源是此模块的状态 -->
          <!-- 它就像JavaScript中传入某个函数内的回调函数，该回调函数可对外部数据访问而不是函数内 -->
          <span>{{ text }}</span>
     </dialog>
</template>
<script>
     new am.Module ( {
          init : function () {
               return { text: "this is external HTML template" };
          },
          // ...
     } );
</script>
```
### \# subElements的单数分块
如果你希望开发的`Dialog`分为头部和内容两部分视图，再混合到组件模板的不同位置，`subElements`也允许你这样编写html片段：
```html html
<dialog>
    <header>
        <span>this is a title</span>
    </header>
    <content>
        <span>this is external HTML template</span>
    </content>
</dialog>
```
`<header>`和`<content>`将分发的代码块分为了两部分，你可以在组件视图中分别将它们插入到不同的位置，只需在组件中分别定义`Header`、`Content`两个** 组件子元素 **：
```javascript javascript
am.class ( "Dialog" ).extends ( am.Component ) ( {
    init : function () { ... },
    render : function () {

        // 指定分块的组件子元素名
        // 组件子元素名也需遵循首字母大写的驼峰式规则，在组件元素内使用时也是全部小写的中划线式规范
        this.subElements ( "Header", "Content" )
        .template ( [
            "<div>",
                "<div>{{ subElements.Header }}</div>",
                "<div>{{ subElements.Content }}</div>",
            "</div>"
        ].join ( "" ) );
        // <header>、<content>两个子元素只能作为<dialog>子元素使用
        // 组件模板中分别通过subElements.Header和subElements.Content输出对应的html分块片段
    }
    // ...
} );
```


此时`Dialog`组件将会被渲染成：
```html html
<div>
    <div><span>this is a title</span></div>
    <div><span>this is external HTML template</span></div>
</div>
```
> ①. 如没有在`this.subElements`函数中定义相应的组件子元素时，Amaple只会将它们作为普通dom元素对待。
②. 除`<header>`、`<content>`外的其他html片段会自动包含在`subElements.default`中。

### \# subElements的不定数分块
`subElements`的分块分发可能会让你想到很多原生的元素，如`<ul>`和`<li>`、`<select>`和`<option>`、`<table>`和`<tr><td>`等，他们都属于包含与被包含的关系，但你会发现其实`<ul>`中可以定义一个或多个，在`subElements`中你也可以定义一个** 组件子元素 **的不定数分块，如`Grid`组件（网格）可包含不定个数的`GridItem`：
```html html
<grid>
    <grid-item>a</grid-item>
    <grid-item>b</grid-item>
    <grid-item>c</grid-item>
</grid>
```
在组件中这样定义不定数分块的`subElements`：
```javascript javascript
am.class ( "Grid" ).extends ( am.Component ) ( {
    init : function () { ... },
    render : function () {
        this.subElements ( { elem: "GridItem", multiple: true } )
        .template ( [
            "<ul>",
                "<li :for='item in subElements.GridItem'>{{ item }}</li>",
            "</ul>"
        ].join ( "" ) )
        .style ( ... );
        // 此时局部变量subElements.GridItem为一个包含所有GridItem分块片段的数组，在组件内使用:for指令循环输出，
        // 也可以使用数组索引如subElements.GridItem [ 0 ]
        
        // 其实上面定义单数分块的Header的全写是{ elem: "Header", multiple: false }，但它可缩写为"Header"
    }
    // ...
} );
```