扇贝网查词Chrome扩展,Chrome上查词更方便。

参考了有道词典扩展的实现，代码是随便写出来的，quick & dirty。如果扇贝做了什么变动随时都可能用不了。不过我会及时更新的，自己也一直在用这个添加新词。

无论如何，有问题没问题都欢迎给我反馈。

邮箱：![http://dourok.info/wp-content/uploads/2010/04/mail.png](http://dourok.info/wp-content/uploads/2010/04/mail.png)

## bug ##

chromium不能播放读音，参考这里http://downloadsquad.switched.com/2010/06/24/play-embedded-mp3-audio-files-chromium/

不过Linux下chromium还是不能播放读音，html5的audio标签好像不能很好的支持。

chrome则未没有发现问题。

## update ##
### 2012-2-25 ###
  * [malfurion.stormrage](http://code.google.com/u/MalFurion.Stormrage@gmail.com/) 为项目带来一个大改动：划词搜索。支持自动添加生词，支持自动播放读音，还可以扩展其它查词引擎，目前支持google翻译，中英文wikipedia。真的很强大～
  * 版本号也迈向0.3了。
### 2011-7-30 ###
  * 之前大意api地址仍用shanbay.com，现不可用，已修改为www.shanbay.com
### 2011-7-17 ###
  * [ljbha007](http://code.google.com/u/101388122646850848801/)添加了右键查词的功能
  * 移除了更新提醒
### 2011-7-14 ###
  * 修复不能登录的问题
    * 原来是用的shanbay.com被重定向到www.shanbay.com，已修改成www.shanbay.com
  * 增加了个新版本提醒的特性
### 2011-6-5 ###
新图标,![http://www.shanbay.com/img/apple-touch-icon.png](http://www.shanbay.com/img/apple-touch-icon.png)
### 2011-6-5 ###

扇贝网现在支持API了，开放了不少功能，给力啊。但是秉承着够用就好的原则，v0.2只是对新API重新实现，功能还是原来那样，不过还是尝试增加了添加例句的功能。右键菜单和页面取词的功能还没有，这个挺实用，正在考虑怎么实现。

v0.2
新特性
  * 有版本号了
  * 通过扇贝网API来查词，速度快了一些，不过API需要登录才能使用，所以未登录还是走原来的路线。
  * 现在可以添加例句了，不过不怎么实用，复制粘帖是个悲剧
修复
  * 窗口可以自动收缩了
  * 声明页面编码为utf-8，可能可以解决一些乱码问题

## 其他 ##

下载：链接同样在左边，或者点这里[shanbay-chrome-extension.crx](http://shanbay-chrome-extension.googlecode.com/files/shanbay-chrome-extension.crx)