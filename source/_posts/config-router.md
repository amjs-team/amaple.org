---
title: 路由配置
date: 2018-02-14 23:43:56
categories: 基础
index: 7
---
# 路由配置
在** 第1节《启动路由》 **章节中为了能让单页应用顺利跑起来，我们提前介绍了简单的路由配置方法。我们已了解路由配置的目的是指定不同的url下对应的** 模块节点（也叫做模块容器）**内应该显示哪个模块的内容，它还有更多高级的用法如匹配路由通配符的配置、重定向等。
## 配置静态匹配路由
一个路由路径是具体的路径如`/`、`/about`，那么它们就属于静态路由。这里我们试着配置一个复杂点的静态匹配路由，在正常情况下，如果一个url的相对路径中存在两级目录，那么在模块结构中也有相应嵌套层数，如：
```javascript javascript
// 假如已知module/index.html、module/about.html中都已定义了一个不具名的嵌套模块节点
am.startRouter ( {
routes: function ( router ) {

        // 顶层路由路径为"/"时表示根目录，顶层模块的路由路径一般需以“/”开头
        router.module ().route ( "/", "module/index", function ( childRouter ) {

            // 子路由中目录名配置为""时表示二级目录为空，此时相对路径为“/”将会匹配到此空目录。
            // 配置空目录时，你也可以这样设置：childRouter.module ().defaultRoute ( "module/index/default" )
            childRouter.module ().route ( "", "module/index/default" ).route ( "describe", "module/index/describe" );
        } )
        .route ( "/about", "module/about", function ( childRouter ) {

            // 配置路由路径时可传入一个路径数组，这样表示访问“/about/amaplejs”或“/about/amaple”都将映射到“module/about/amaplejs”模块
            childRouter.module ().route ( [ "amaplejs", "amaple" ], "module/about/amaplejs" ).route ( "jquery", "module/about/jquery" );
        } );
    },
    // ...
} );
```
## 匹配路由通配符
实际项目中我们经常需要多个甚至所有的路由路径都匹配同一个模块，如一个文章模块，不同`id`的文章都将匹配此模块，又比如一个页面的** header **和** footer **模块总是保持原样。显然，这不可能在配置路由时使用数组列出所有的路由路径，此时我们就需要使用匹配路由通配符来解决这个问题：
```javascript javascript
am.startRouter ( {
    routes: function ( router ) {

        // 匹配路由通配符以“:”开头
        router.module ( "article" ).route ( "/article/:id", "module/article" );
        // 这样如“/article/123”、“/article/456”、“/article/789”等都将会匹配module/article.html模块
    },
    // ...
} );
```
当url为`/article/123`时，文章模块的`am.Module`对象中将在`param`对象中创建`id`参数，你可以通过`id`的参数值获取对应的文章内容进行显示：
```javascript javascript
new am.Module ( {
    mounted : function ( http ) {
        var _this = this;

        // 此时this.param.id的值为"123"，即:id通配符所匹配的字符串
        // 使用http预定义插件请求数据
        http.get ( "article?id=" + this.param.id, "json" ).done ( function ( res ) {
            _this.state.title = res.title;
            _this.state.content = res.content;
        } );
    }
} );
```
匹配路由通配符也支持在多级目录同时设置，这是会在`param`对象中创建多个对应的属性。
```javascript javascript
// 这是会在模块对象的param中创建date和id两个属性
router.module ( "article" ).route ( "/article/:date/:id", "module/article" );
```
匹配路由通配符还允许你通过正则表达式限制匹配的内容。
```javascript javascript
// “/article/:id(\\d+)”表示id通配符只匹配一位或多位的数字
// 如它可匹配“/article/123”，但不能匹配“/article/a123”
// 正则表达式中使用“\”转义时应该成双出现
router.module ( "article" ).route ( "/article/:id(\\d+)", "module/article" );
```
> 如果url从`/article/123`跳转到`/article/456`时文章模块不会被替换，但param.id的值被更新为`456`，这时文章模块的`paramUpdated`** 生命周期函数 **就会被调用。

## 重定向
通过`router.redirect`函数你可以从一个路径重定向到另一个路径，重定向的起始目录取决于当前正在匹配的路由目录：
```javascript javascript
am.startRouter ( {
    routes: function ( router ) {

        // 在顶层目录中将“/”重定向到“/index”
        router.redirect ( "/", "/index" );
        // 重定向的优先级高于匹配模块，所以router.redirect函数可在route函数前面或后面调用，都会优先重定向路径

        router.module ().route ( "/index", "module/index", function ( childRouter ) {

            // 重定向的匹配路径与跳转路径也可以设置通配符
            childRouter.redirect ( "introduce/:title", "describe/:title" );
            // 第二层的重定向起始目录为“/index/”之后的路径
            // 如“/index/introduce/i_am_a_title”的“introduce/i_am_a_title”部分将会被这层的重定向匹配，并重定向到“describe/i_am_a_title”

            childRouter.module ().route ( "", "module/index/default" ).route ( "describe/:title", "module/index/describe" );
        } );
    },
    // ...
} );
```
## 强制重新渲染一个模块
我们已了解有时候更新模块时部分模块不会被替换，这些模块不会被卸载重新渲染，但你有时可能希望它们回到初始化状态，这时`router.forcedRender`函数就可以帮上忙了，它能强制让一个本来不需卸载的模块卸载并重新渲染：
```javascript javascript
am.startRouter ( {
    routes: function ( router ) {

        // 为“article”模块节点配置时直接调用forcedRender函数，该模块节点内渲染的模块都会强制重新渲染
        router.module ( "article" ).forcedRender ().route ( "/article/:id", "module/article" );
    },
    // ...
} );
```
## 设置404错误路径
当加载一个或多个模块时，任意一个模块文件未找到时将会触发** 404错误 **路径的模块匹配，配置** 404错误 **路径如下：
```javascript javascript
am.startRouter ( {
    routes: function ( router ) {

        // 调用router.error404函数设置404路径，此函数只能在最外层路由对象调用
        // 错误路径建议以“/”开始
        router.error404 ( "/404" );


        // 为404路径配置渲染模块
        router.module ( "article" ).route ( "/404", "module/404" );
        // ...
    },
    // ...
} );
```

> ** 恭喜你，已学到最后一节了，快去实际项目中练习使用吧 **