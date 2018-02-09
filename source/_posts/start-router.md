---
title: 启动路由
tags: Amaple教程
---
# 启动路由
开始编写具体的代码前，首先需启动单页模式并进行简单配置。在`src/index.html`中引入amaple.js框架文件后我们就可以使用`am`这个全局对象。我们在开发包的`src/config.js`文件中调用`am.startRouter`函数并传入一个Object对象进行启动路由并配置单页应用。首先我们来配置url风格：
```javascript
am.startRouter ( {

     // amaplejs中存在两种url模式，分别为
     // url中带“#”的hash模式，所有浏览器都支持此模式。可使用history: am.HASH指定
     // url中不带“#”的restful模式，此模式使用html5 history API实现，与普通url相同，
     // 但在不支持此特性的浏览器中不能正常使用，且需后台服务端的配置支持，可使用history: am.BROWSER指定
     // 以上为两种可选的url模式,你也可以指定history : am.AUTO来让框架自动选择模式，在支持html5 history API的浏览器下自动使用此模式，
     // 不支持的情况下将自动回退使用hash模式
     history : am.HASH
} );
```
## 配置一个简单的匹配路由
正如我们所知到的，不同url将会显示不同的页面，在这里我们也需告诉框架一个url应该显示哪几个模块，其实这也是很简单的，具体分为两步：
* [1].在入口html文件（即`src/index.html`文件）内定义一个模块节点，来告诉框架请求的模块内容放到页面的哪个位置
```html
<body>
     <!-- 在<body>内添加一个<div>并给它添加:module属性，这样就指定了一个不具名的模块节点 -->
     <!-- 你可以将模块节点理解为模块渲染输出的容器，:module属性为空值表示不具名的模块节点，且任何标签都可以作为模块节点 -->
     <div :module></div>
</body>
```
* [2].在`am.startRouter`函数中为模块设置相关参数，在函数参数内分别添加`baseURL`、`module`和`routes`参数，如下：
```javascript
am.startRouter( {
    baseURL : {
          // 为模块文件设置base路径，所有的模块文件请求路径都将基于“/module”目录，不设置时默认“/”
          module: "/module"
     },

     // 模块文件后缀，其实默认的模块文件后缀就是“.html”，你也可以为它设置其他后缀
     module : {
          suffix: ".html"
     },

     // routes定义的function接收一个Router类的对象，使用此对象我们就可以告诉框架一个url应该显示哪几个模块
     routes : function ( router ) {

          router.module ().route ( "/", "index" ).route ( "/about", "about" );
          // 在module和route函数内都会返回router对象本身，所以可使用链式调用
          // router.module函数选定配置的模块节点，函数内没有传入任何参数表示选定一个不具名的模块节点，
          // 我们在<body>内已定义了一个不具名的模块节点
          
          // 你也可以为模块指定名称，像这样<div :module="main"></div>，
          // 此时需这样调用router.module ( "main" )来选定模块节点。
          
          // router.route函数为选定模块配置匹配路径与模块的映射，
          // 当url相对路径为“/”时将加载index.html模块文件，当url相对路径为“/about”时将加载about.html模块文件
     },

     // 已讲解过的配置
     history : am.HASH
} );
```
> 简单的配置后，接下来就可以来编写这个`index.html`模块文件了，在`src/module`文件夹内添加一个`index.html`文件。