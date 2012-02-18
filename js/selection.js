/*
 * selection.js
 * 2012-2-18
 * 
 * 用于在网页中选择文本时弹出翻译或相关内容。
 * 需求所有网页权限。
 * 
 * ----ChangeLog----
 * 2012-2-18 MalFurion.StormRage@gmail.com
 * 使用jQuery重写
 * 使用全局的ShanbayChromeExtension对象避免命名空间污染
 * 单独抽取引擎代码，更方便扩展其他搜索引擎
 * 展示层预留样式表接口
 * 
 * 2012-2-16 MalFurion.StormRage@gmail.com
 * 实现Google Translate
 */

var ShanbayChromeExtension = {}

ShanbayChromeExtension._engineMeta = [ {
  name : "谷歌翻译",
  url : "http://translate.google.com/translate_a/t?client=t&text={{text}}&hl=en&sl=auto&tl=zh-CN&multires=1&otf=2&ssel=0&tsel=0&uptl=zh-CN&sc=1",
  parser : function(data) {
    var result = eval(data);

    var caption = "<a href=\"http://translate.google.com\" target=\"_blank\" style=\"color:white\">谷歌翻译</a>";
    var content = "";
    var i;

    if (!result[1]) {
      // 整句翻译
      for (i in result[0]) {
        content += result[0][i][0];
      }

    } else {
      // 翻译一个单词，多种释义使用表格展示
      content = "<table>";
      for (i in result[1]) {
        content += "<tr><th style=\"background-color: lightgray;\">"
            + result[1][i][0] + "</th><td>" + result[1][i][1].join("；")
            + "</td></tr>";
      }
      content += "</table>";
    }

    return new Array(caption, content);
  }
} ];

// 结果展示层的样式
ShanbayChromeExtension._resultDivClass = "shanbay_extension_result";
ShanbayChromeExtension._engineDivClass = "shanbay_extension_result_engine";
ShanbayChromeExtension._captionDivClass = "shanbay_extension_result_caption";
ShanbayChromeExtension._contentDivClass = "shanbay_extension_result_content";

// 结果展示层的选择器
ShanbayChromeExtension._resultDivId = "shanbay_extension_result";
ShanbayChromeExtension._resultDivSelector = "#"
    + ShanbayChromeExtension._resultDivId;

// 最后一次查询的词
ShanbayChromeExtension._lastQuery = null;

// 引擎
ShanbayChromeExtension._engines = new Array();

// 引擎类
ShanbayChromeExtension._Engine = function(id, meta) {
  // id: 在ShanbayChromeExtension._engines中的索引
  // meta: {name, url, parser}
  // ID和引擎名
  this._id = id;
  this._name = meta.name;

  // 标题和内容的选择器
  var prefix = ShanbayChromeExtension._resultDivId + "_" + this._name;
  this._engineDivId = prefix;
  this._captionDivId = prefix + "_caption";
  this._contentDivId = prefix + "_content";

  prefix = "#" + prefix;
  this._engineDivSelector = prefix;
  this._captionDivSelector = prefix + "_caption";
  this._contentDivSelector = prefix + "_content";

  // 请求的URL，查询字符串使用占位符{{text}}清
  this._url = meta.url;

  // 将结果转为可直接放在div中的html，需要使用数组返回标题和内容
  this._getHtmlsFromResult = meta.parser;

  if (typeof ShanbayChromeExtension._Engine._initialized == "undefined") {
    ShanbayChromeExtension._Engine._initialized = true;

    // 引擎的主要方法，查询并展示结果
    ShanbayChromeExtension._Engine.prototype.queryAndShow = function(text) {
      $(this._contentDivSelector).hide();
      var id = this._id;
      var url = this._url.replace("{{text}}", text);
      $.get(url, function(data) {
        ShanbayChromeExtension._engines[id]._showResult(data);
      });
    }

    // 转换查询结果并展示在自己的div中
    ShanbayChromeExtension._Engine.prototype._showResult = function(data) {
      var htmls = this._getHtmlsFromResult(data);
      $(this._captionDivSelector).html(htmls[0]);
      $(this._contentDivSelector).html(htmls[1]).slideDown("slow");
    }
  }
}

// 初始化
ShanbayChromeExtension.initialize = function() {
  this._initEngine();
  this._initResultDiv();
}

// 初始化查询引擎
ShanbayChromeExtension._initEngine = function() {
  var i;
  for (i in this._engineMeta) {
    this._engines[i] = new this._Engine(i, this._engineMeta[i]);
  }
}

// 初始化展示结果用的层
ShanbayChromeExtension._initResultDiv = function() {
  // 主层
  var resultDiv = document.createElement("div");
  resultDiv.id = this._resultDivId;
  resultDiv.className = this._resultDivClass;
  $("body").append(resultDiv);

  $(this._resultDivSelector).css({
    position : "absolute",
    display : "none",
    "z-index" : "100",
    overflow : "hidden",
    width: "500px"
  });

  // 引擎层
  var i, engine, engineDiv, captionDiv, contentDiv;

  for (i in this._engines) {
    engine = this._engines[i];

    engineDiv = document.createElement("div");
    engineDiv.id = engine._engineDivId;
    engineDiv.className = this._engineDivClass;
    $(this._resultDivSelector).append(engineDiv);

    captionDiv = document.createElement("div");
    captionDiv.id = engine._captionDivId;
    captionDiv.className = this._captionDivClass;
    $(engine._engineDivSelector).append(captionDiv);
    $(engine._captionDivSelector).css({
      height : "20px",
      "background-color" : "#209E85",
      color : "white"
    });

    contentDiv = document.createElement("div");
    contentDiv.id = engine._contentDivId;
    contentDiv.className = this._contentDivClass;
    $(engine._engineDivSelector).append(contentDiv);
    $(engine._contentDivSelector).css({
      "background-color" : "yellow"
    });
  }
}

// 获取选中的文本，如果无效，返回空
ShanbayChromeExtension._getValidSelection = function() {
  // trim
  var text = String(window.getSelection()).replace(/(^\s*)|(\s*$)/g, "");

  // same word?
  if (this.lastQuery == text) {
    text = "";
  } else {
    this.lastQuery = text;
  }

  return text;
}

// 监听鼠标释放事件
ShanbayChromeExtension.onSelect = function(event) {
  if (event.button != 0) // left button
    return;

  var text = this._getValidSelection();
  if (!text) {
    return $(this._resultDivSelector).fadeOut();
  }
  $(this._resultDivSelector).css({
    left : event.pageX + "px",
    top : event.pageY + 10 + "px"
  }).fadeIn();

  var i;
  for (i in this._engines) {
    this._engines[i].queryAndShow(text);
  }
}

$("body").ready(function() {
  ShanbayChromeExtension.initialize();
  $("body").mouseup(function(event) {
    ShanbayChromeExtension.onSelect(event);
  });
});
