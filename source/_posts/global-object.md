---
title: 全局对象am
date: 2018-02-15 14:20:16
categories: API
index: 1
---
# 全局对象`am`
- **类型：**Object
- **描述：**am对象是此框架对外暴露的APIs。其中包括模块定义类Module、类定义方法`class`及组件基类`Component`、单页路由启动方法`startRouter`及路由模式参数`BROWSER_HISTORY`和`HASH_HISTORY`、插件安装方法`install`等强大的API。
- **APIs**
## am.Module(lifeCycleDefinition: Object)
- **类型：**Class
- **描述：**通过使用`new`关键字定义一个模块，`am.Module`构造函数将接收`param`、`get`、`post`请求参数，转换ViewModel数据，解析并动态绑定模块视图等工作。`Module`对象有5个阶段的生命周期，分别为`init`、`mounted`、`paramUpdated`、`queryUpdated`、`unmount`（[查看Module生命周期详解](/doc/module?target=%E6%A8%A1%E5%9D%97%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)）
- **参数：**lifeCycleDefinition|Object：Module对象的生命周期定义对象
- **返回值：**`Module`对象，它包含了对模块的状态、请求参数及组件等引用
- **对象属性**
    - **param**：`location.pathname`中动态匹配路由通配符所获得的键值对，键为通配符名称，值为`pathname`中的通配符匹配值（查看匹配路由通配符）
    - **get**：当前url中的`get`参数字符串（即`location.search`）解析后的对象，键为`get`参数名，值为对应的`get`参数值
    - **post**：表单post提交时的数据对象，键为表单`name`属性值，值为对应表单值（post对象只有在post提交后跳转的模块存在值，其他情况为空对象）
    - **parent**：父级模块对象引用，最顶层模块的`parent`值为`null`
    - **state**：模块视图动态绑定的状态数据，它是一个ViewModel对象，当状态数据发生改变时，相应的视图也将发生相应的改变
    - **components**：模块内所有已渲染的组件对象数组（注意：组件对象数组是框架内部计算模块行为时需调用组件的相应生命周期钩子函数，不推荐开发者直接获取此数组内的组件对象进行使用，而应该采用`:ref`指令来引用对应的组件，使用模块方法`refs`来获取对应的组件行为对象进行组件行为操作）
    - **references**：模块内使用`:ref`指令引用的dom元素或组件的引用数组
    > 不推荐开发者直接获取此数组内的引用，这样可能会得到不正确色引用结果，开发者应该使用模块方法“refs”来获取引用，该方法会验证被获取dom元素或组件状态并返回正确状态的引用

- **成员函数**
    - **refs(refName: String)**
        - **类型：**Function
        - **描述：**通过传入被引用名称（使用模板指令`:ref`引用元素或组件）获取模块下被引用的dom元素或组件行为对象
        - **参数：**`(refName | String)`模板指令`:ref`的值，表示被引用dom元素或组件的引用名称
        - 返回值：
            - 当被引用对象为dom元素时返回此dom元素
            - 当被引用对象为组件对象时返回此组件的行为对象([什么是行为对象？](#))
            - 当一个引用名称引用了多个dom元素或组件时，返回此引用集合的数组
            - 未找到对应引用时返回`undefined`
            - 注意：当dom元素或组件被移除或隐藏后不存在DOM树时返回`undefined`

## am.class(className:String)
- **类型：**Function
- **描述：**ES6式的类定义函数，支持开发者以类似ES6 class的方式来定义一个类及继承基类，它一般用于通过继承`am.Component`来定义一个组件衍生类（[组件衍生类？](#)）。在此方法传入类名字符串（类名需符合变量命名规则），它将返回一个`classDefiner`用于继承基类与定义类构造函数`(constructor）`、类成员函数及类静态函数。通过调用`classDefiner.extends`函数并传入`Function`或`null`（传入`null`时相当于未继承任何基类）来指定一个基类，`extends`函数将返回`classDefiner`本身，然后再链式调用并传入一个包含类构造函数、类成员函数或类静态函数的对象对该类进行构造，此时将会返回被构造的类。示例：
```javascript javascript
// 定义一个基类
var parent = am.class("parent") ({
	constructor: function (){        // 指定类构造器的名称为"constructor"
		this.memberVar = 0;          // 定义成员变量
	},
	memberFn: function (){},     	 // 定义成员函数
	statics: {
		staticVar: 1,                // 定义类静态变量
		staticFn: function (){}      // 定义类静态函数
	}
})
// =========================
// =========================
// 定义子类并继承基类：
var son = am.class("son").extends(parent) ({
    constructor: function () {
        this.__super();          // 调用基类构造函数，子类在定义成员变量时必须先调用this.__super()
    }
})
```

- **参数：**`(className | String)`定义的类名
- **返回值：**类定义函数（classDefiner），通过`classDefiner.extends`函数指定继承基类，通过`classDefiner`函数本身构造一个类

## am.Component(lifeCycleDefinition: Object)
- **类型：**Class
- **描述：**所有组件衍生类的基类，`Component`只能被另一个类继承而不可直接创建对象。通过使用类定义函数`am.class`实现`Component`的继承并生成组件衍生类。组件对象有5个阶段的生命周期，分别为`init`、`render`、`mounted`、`updated`、`unmount`（[查看Component生命周期详解](#)）
- **参数：**无
- **返回值：**无
- **类静态函数：**
    - defineGlobal(componentDerivative: Function)
        - **类型：**Function
        - **描述：**定义一个全局组件衍生类，所有的`Module`和组件衍生类中在不需明确指定依赖的情况下可使用全局组件衍生类
        - **参数：**`(componentDerivative | Function)`组件衍生类
        - **返回值：**无

## am.startRouter(singlePageConfig: Object)
- **类型：**Function
- **描述：**启动路由并初始化单页配置，配置项如下：
- **baseURL**
    - **类型：**Object
    - **描述：**定义模块、组件及插件加载的基础路径，格式为`{ module: "...", component: "...", plugin: "..." }`
    - **默认值：**`{ module: "/", component: "/", plugin: "/" }`
- **history：**
    - **类型：**Number
    - **描述：**设置单页模式时使用的history类型，可选值：
        - **am.HASH：**强制使用hash模式（即url中带有“#”锚点的模式），此模式将在当前显示pathname放在“#”之后，与普通url稍有不同，但此模式适用于包括不支持html5 history API新特性的所有浏览器。
        - **am.BROWSER：**强制使用html5 history API模式，此模式的url与普通url相同，但在不支持history API新特性的浏览器中不能正常使用，且需后台服务端的配置支持，当刷新浏览器时服务端需返回首页html，以防止404的出现（具体服务端配置方法）
        - **am.AUTO：**在支持html5 history API的浏览器下自动使用此模式，不支持的情况下将自动回退使用hash模式
    - **默认值：**am.AUTO
- **routes：**
    - **类型：**Function
    - **描述：**路由配置函数，它将接收一个Router类的对象，开发者可调用此对象来配置路由，Router类的对象介绍如下：
        - **类型：**Object
        - **描述：**Router类的对象用于定义路由，路由的作用在于告诉框架当前或即将跳转的pathname应该显示什么内容，从而使不同的pathname显示不同的页面内容
        - **对象函数：**
        	- **module(moduleName?: String)**
        	    - **类型：**Function
        	    - **描述：**在路由结构中指定一个模块，只有先指定一个模块后才可对此模块配置相应的路由。参数为模块的名称（即`:module`指令的值），当不传入模块名时为指定当前层级的default模块
        	    - **参数：**`(moduleName? | String)指定的模块名，当不传入模块名时为指定当前层级的defualt模块
        	    - **返回值：**当前对象，供链式调用
        	- **route(pathExpr: String|Array, modulePath: String, childDefineFn?: Function)**
        	    - **类型：**Function
        	    - **描述：**定义模块路径与路由匹配表达式的映射，以及该模块下的子模块与路由匹配表达式映射。参数`pathExpr`一般顶层模块以“/”开头，嵌套层直接以目录名定义，它分为三种形式：
        	        - **固定路由字符串：**如`/setting`，它将匹配pathname中根目录的`/setting`部分
        	        - **路由通配符字符串：**通配符以“:”开头，如`/:type`，它将匹配pathname中根目录的任何字符串，并会以键值对的形式保存到param对象中供匹配模块的Module对象引用。路由通配符还支持末尾添加“(正则表达式)”来限制匹配的范围，如：`/:type(\\d+)`，表示只匹配以为或多位数字
        	        > 括号内的正则表达式字符串需符合new RegExp传入的正则表达式格式，`\`应该成双出现

        	        - **混合路由数组：**数组内包含以上两种形式的一种或两种，只要符合数组内的任何一个路由表达式都将匹配成功。
        	    - **参数：**
        	        - `(pathExpr | String/Array)`路由匹配式，分为固定路由字符串、路由通配符字符串及混合路由数组三种形式
        	        - `(modulePath | String)`模块请求的路径，模块请求时前后将分别会拼接`baseURL`和`moduleSuffix`
        	        - `(childDefineFn? | Function)`此模块的子模块路由定义函数，函数同样接收一个`Router`类的对象。当没有子模块时可不传此参数
        	    - **返回值：**当前对象，供链式调用
        	- **defaultRoute(modulePath: String, childDefineFn?: Function)**
        	    - **类型：**Function
        	    - **描述：**定义一个路由匹配表达式为空(`""`)的模块路径映射，相当于调用`route`函数时传入的`pathExpr`为`""`。此函数一般用于定义子模块的路由匹配表达式映射。
        	    - **参数：**
        	        - `(modulePath | String)`模块请求的路径，模块请求时前后将分别会拼接`baseURL`和`moduleSuffix`
        	        - `(childDefineFn? | Function)`此模块的子模块路由定义函数，函数同样接收一个`Router`类的对象。当没有子模块时可不传此参数
        	    - **返回值：**当前对象，供链式调用
        	- **redirect(from: String|Array, to: String)**
        	    - **类型：**Function
        	    - **描述：**定义当前层级的路由目录重定向，每个目录层级都可以设置重定向，当当前层级的路由目录与`from`参数匹配时将会重定向到`to`参数，并且使用重定向后的pathname进行路由匹配。`from`参数的值分为三种形式：
        	        - **固定路由字符串：**如`/setting`，它将匹配pathname中根目录的`/setting`部分
        	        - **路由通配符字符串：**通配符以“:”开头，如`/:type`，它将匹配pathname中根目录的任何字符串，并会以键值对的形式保存到param对象中供匹配模块的Module对象引用。路由通配符还支持末尾添加“(正则表达式)”来限制匹配的范围，如：`/:type(\\d+)`，表示只匹配以为或多位数字
        	        > 括号内的正则表达式字符串需符合`new RegExp`传入的正则表达式格式，`\`应该成双出现

        	        - **混合路由数组：**数组内包含以上两种形式的一种或两种，只要符合数组内的任何一个路由表达式都将匹配成功。
        	    - **参数：**
        	        - `(from | String/Array)`重定向路由匹配式，分为固定路由字符串、路由通配符字符串及混合路由数组三种形式
        	        - `(to | String)`重定向的目标path
        	    - **返回值：**当前对象，供链式调用
        	- **forcedRender()**
        	    - **类型：**Function
        	    - **描述：**强制渲染模块，默认情况下当无刷新跳转匹配时，部分匹配相同路由的模块不会重新渲染，只会渲染那些需更新的模块，当模块被设置为**forced render**后，这部分匹配相同路由的模块也会强制重新渲染。
        	    - **参数：**无
        	    - **返回值：**当前对象，供链式调用
        	- **error404(path404: String)**
        	    - **类型：**Function
        	    - **描述：**设置404页面路径，页面跳转时如果有任何一个模块未找到对应模块文件则会重定向到404路径并重新匹配路由来更新模块。
        	    - **参数：**`(path404 | String)`404错误时的更新路径
        	    - **返回值：**无
- **moduleSuffix：**模块文件的后缀名，Router定义路由时不需指定模块文件的后缀名，它将统一使用此变量
    - **默认值：**`.html`
- **plugin**
    - **类型：**Array
    - **描述：**定义项目中所使用的插件集合，数组内可指定插件加载路径（基于`baseURL`）或插件安装对象（存在`name`属性和`build`方法的对象），当指定插件安装对象时内部会自动调用`am.install`方法安装此插件
	> 路由启动后框架将获取当前url或即将跳转的url至上而下匹配已设置的路由，获得需更新模块的数据并按从外到内的顺序更新对应模块

	- **参数：**`(singlePageConfig | Object)`单页应用初始化配置对象

## am.install(pluginDefinition: Object)
- **类型：**Function
- **描述：**安装一个插件，
	- **构建：**调用此函数并传入包含`name`属性和`build`函数的插件定义对象，`name`属性指定了插件名称，它必须符合变量命名规则，`build`为插件的构建函数，内部`this`指向`am`对象，它的返回值将作为此插件实体供开发者使用
	- **使用：**插件实体可在`Module`、`Component`生命周期钩子函数及插件的`build`构建函数中，指定函数接收的参数名为对应插件的名称将会自动注入对应的插件实体在该函数内使用。示例：
	```javascript javascript
		new am.Module ({
		    init: function (promise) { ... },     // init函数内将自动注入promise插件
		    mounted: function (http) { ... }      // mounted函数内将自动注入http插件
		});
	```