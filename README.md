#fis3-preprocessor-project

fis 打包前处理插件

## 背景
在html中嵌入图片: 当图片为`svg`时fis3也会编译为base64。修正行为，当图片格式为`svg`时编译成svg标签，同时继承img的class。

在html中嵌入页面: fis3不会去格式化链接地址，导致生成出的路径不对。修正行为，对`link,script,a,iframe,img,embed,audio,video,object,source`等地址进行格式化。

## 安装
```
$ npm install -g fis3-preprocessor-project
```

## 使用
```javascript
fis.match('*', {
    preprocessor: fis.plugin('project')
});
```
