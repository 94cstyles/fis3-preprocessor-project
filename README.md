#fis3-preprocessor-project

fis 打包前处理插件

## 背景
在html中嵌入图片: 当图片为`svg`时fis3也会编译为base64。修正行为，当图片格式为`svg`时编译成svg标签，同时继承img的class。

在html中嵌入页面: fis3不会去格式化链接地址，导致生成出的路径不对。修正行为，对`link,script,a,iframe,img,embed,audio,video,object,source`等地址进行格式化。

一般的项目会在多个地方进行发布，比如线上环境、内网环境、本地环境，除了配置以外。我们还希望能将特定的代码区块裁剪掉。

## 安装
```
$ npm install -g fis3-preprocessor-project
```

## 使用
```javascript
fis.match('*', {
    preprocessor: fis.plugin('project', {
        env: 0
        ...
    })
});
```

## 代码块预处理

```javascript
/*<debug>*/
//env != 0 时删除该代码块
/*</debug>*/

/*<remove>*/
//env == 0 时删除该代码块
/*</remove>*/

/*<remove trigger="@env == 1">*/
//env == 1 时删除该代码块
/*</remove>*/

/*<remove trigger="@env == 1 && @v == 1">*/
//@v 需要从插件处配置
fis.plugin('project', {
    www: '',
    useHash: false,
    env: 1,
    v: 1
});
/*</remove>*/
```

### css 区域定义

```css
#panel {
/*<debug>*/
  background-color: red;
/*</debug>*/
}
```

### html 区域定义

```html
<!--remove trigger="@env != 0"-->
<span>测试版本，请勿对外公开</span>
<!--/remove-->
```