---
title: 模块
tags: Amaple教程
---
# 模块
正如它的名字，模块用于amaplejs单页应用的页面分割，所有的跳转更新和代码编写都是以模块为单位的。
## 定义一个模块
一个模块由`<module>`标签对包含，内部分为template模板、JavaScript和css三部分，像这样：
```html
<module>
    <template>
        <!-- 编写模块的html模板 -->
        <span>hello amaplejs,page index</span>
        <a href="/about?from=index">direct to page about</a>
    </template>

    <script>
     
        // 编写模块JavaScript代码
        // 在一个模块的JavaScript中，am为自动注入对象，你不需引入它，即使是在webpack环境下
        // 这里通常使用new am.Module()创建一个amaple模块对象，它将会在构造函数中处理模板内容和模板样式等一系列的初始化工作
        new am.Module ();
    </script>

    <style scoped>
        /* 编写模块样式 */
        span { font-size: 20px; }
    </style>
</module>
```
## 设置模块局部样式
大多数情况下我们可能更希望让一个模块中的css样式只作用当前的html模板，这当然我们也有所考虑，只需在`<style>`中添加`scoped`属性就会自动限制它的作用范围了，就是如此简单。但如果`<style>`不带`scoped`属性时将不会只作用到当前的html模板内。
## 模块生命周期
当我们在编写一个模块的JavaScript时通常使用`am.Module`类创建一个amaple模块对象，它将会在构造函数中进行一系列的初始化工作，而一个模块的生命周期函数将会在初始化的不同阶段，或模块数据改变时自动触发，它们共分为5个阶段，具体如下：
- `init`：模块初始化时触发，它将要求你在定义时返回`<template>`模板中所使用的状态数据
> 关于状态数据的内容将在“模板指令与状态数据（state）”中讲解
- `mounted`：解析模板并挂载状态数据时触发，你可以在这里处理一些模块的后续操作，如为此模块请求网络数据并更新到模板中等。
- `queryUpdated`：模块更新时部分不需被替换的模块，检测到GET或POST参数变化（增加、移除或修改参数）时触发，如所有页面的header部分总是不变，此时它将不会被替换。
- `paramUpdated`：模块更新时部分不需被替换的模块，检测到`param`参数变化（增加、移除或修改参数）时触发，只有设置了路由通配符的模块才有`param`参数。
> 关于路由通配符的内容我们将会在《路由配置》中详细讲解
- `unmount`：在更新模块时被替换的模块将会触发。
你可以这样设置一个模块的生命周期函数：
```html
<template>...</template>
<script>
    new am.Module ( {
        init : function () {
          
        // 返回一个包含状态数据的对象，这些状态数据作用是解析挂载模板
        return {};
    },
    mounted : function () {},
    queryUpdated : function () {},
    paramUpdated : function () {},
    unmount : function () {}
} );
</script>
```
> 【注意】生命周期函数内的`this`指向`am.Module`对象，如果它们使用ES6的箭头函数（Arrow function）会导致函数内`this`指针指向不正确而出错。
## 模块跳转与表单提交
和普通页面一样，模块跳转与表单提交都会改变url，在host与port都相同的情况下都会触发模块更新，否则将进行页面刷新的普通跳转。模块匹配及更新看如下图解：
![](/img/bV2hoZ)
### \# 模块跳转
在普通页面的跳转中，我们使用`<a>`标签设置`href`属性进行跳转，在amaplejs中也是如此，但不同的是，所有dom元素上设置了`href`属性后，点击都可以触发模块更新，并且当`href`后带有`get`参数时将会解析成键值对保存在`am.Module`对象内：
```html
<a href="/about?from=index">direct to page about</a>
```
点击此按钮跳转将会匹配到`/module/about.html`模块，并且`about`模块对象内的`get`参数值为`{from: "index"}`。
```javascript
// about模块内可使用this.get对象的属性值
new am.Module ( {
    init : function () {
        return {
            from: this.get.from
        };
    }
} );
```
### \# 表单提交
amaplejs的表单提交与普通页面的表单提交写法也相同，在`<form>`内编写表单元素并设置`action`属性，它指定表单提交路的路径：
```html
<template>
    <form action="account/register">
        <input type="text" name="username" value="jim" />
        <input type="password" name="pwd" value="jim001" />
        <input type="text" value="10" />
    </form>
    ...
</template>
```
提交表单到`account/register`后，服务端需返回一个路径字符串，来告诉框架表单提交后跳转的路径，它可能像这样：
```php
<?php
    // 表单数据的处理
    // ...

    echo "/submit/success";
?>
```
表单提交后将会使用服务端返回的`/submit/success`路径进行模块的更新跳转，这样就完成了一个表单提交，此时`/submit/success`路径所匹配的模块中会自动生成`post`参数对象`{ username: "jim" }`(表单元素设置了`name`属性，且`type`不为`password`的值才会在`this.post`中创建)：
```javascript
new am.Module ( {
    init : function () {
        return {
            this.username : this.post.username
        };
    }
    // ...
} );
```
> 为了实现多个模块间的跳转，你可以继续创建一个`module/about.html`模块文件，内容与`index.html`几乎相同，像这样：
```html
<module>
    <template>
        <span>hello amaplejs,page about</span>
        <a href="/index?from=about">direct to page index</a>
    </template>

    <script>
        new am.Module ();
    </script>

    <style scoped>
        span { font-size: 20px; }
    </style>
</module>
```
## 嵌套模块
当一个页面需设置二级菜单时，我们可能希望在一个模块中嵌套一个模块节点，而这在amaplejs中也是支持的，你只需在一个模块的`<template>`模板内继续使用`:module`属性定义模块节点，如：
```html
<template>
    <span>hello amaplejs,page index</span>
    <a href="/about?from=index">direct to page about</a>
    <div :module></div>
</template>
```
这样就嵌套了一个不具名的模块节点，你可能会问怎么可以定义两个不具名的模块节点呢，这是因为amaplejs可支持你设置无限层级的嵌套模块，就像html的元素嵌套一样，并且不同层级模块节点的命名空间（namespace）是相互独立的，但相同层级只能有一个不具名的模块节点，且不能出现名称相同的模块节点（其实不具名的模块节点的名称默认是“default”）。
> 【对模块层级的理解】模块层级与dom元素层级无关，需以模块为单位节点作为层级参考标准，不同模块内定义的嵌套模块为不同层级，而同一个模块内定义的嵌套模块不论位置如何都属于同一层级。
### \# 配置子路由
定义嵌套模块节点后，我们也需为它配置路由映射，指定嵌套模块节点在不同url下应该匹配哪些模块：
```javascript
am.startRouter( {
    routes : function ( router ) {

        // 使用route函数的第三个参数设置嵌套模块节点的路由映射
        router.module ().route ( "/", "module/index", function ( childRouter ) {

            // 此回调函数将接收一个childRouter参数
            // 不同层的命名空间是独立的，所以调用router.module函数指定的是嵌套层的模块节点
            childRouter.module ().route ( "subpage", "module/index/sub_page" );
            // 它将首先匹配“/”，然后继续匹配嵌套模块“subpage”
        } )
        .route ( "/about", "module/about" );
    },
    // ...
} );
```
## 父子模块之间的通信
嵌套模块节点与上一层模块节点的关系为父子模块，它们经常需要进行通信，如父模块下发数据到子模块中，或父模块访问子模块的数据，此时你可以这样做：
```javascript
// 在子模块中通过parent属性来获取父模块对象
new am.Module ( {
    init : function () {
    
        // this.parent为父模块对象，当一个模块为最顶层模块时，它的parent属性将为null
        return {
            btnText : this.parent.state.text
        };
    }
    // ...
} );
```
在父模块中不能直接访问到子模块对象，但可通过子模块主动传值的方式让父模块获取到子模块的数据，就像我们的代码作用域，外层作用域不能直接获取内层作用域的值，但可通过内层作用域为外层作用域的变量赋值来访问。在子模块中通过`parent`属性来获取父模块对象，然后调用父模块中定义的模块函数并传入相应的值即可主动传值到父模块了。
> 模块函数将在《模板指令与状态数据》中讲解