/*
 * selection.js
 * 2012-2-19
 * 
 * 用于在网页中选择文本时弹出翻译或相关内容。
 * 需求所有网页权限。
 * 
 * ----ChangeLog----
 * 2012-2-19 MalFurion.StormRage@gmail.com
 * 加入扇贝查词引擎，并实现添加生词
 * 
 * 2012-2-18 MalFurion.StormRage@gmail.com
 * 使用jQuery重写
 * 使用全局的ShanbayChromeExtension对象避免命名空间污染
 * 重构：单独抽取引擎代码，更方便扩展其他搜索引擎
 * 展示层预留样式表接口
 * 
 * 2012-2-16 MalFurion.StormRage@gmail.com
 * 加入Google Translate引擎
 */

var ShanbayChromeExtension = {}

// 引擎元数据，必须提供：
// name: 引擎名
// url: 请求地址，查询字符串使用占位符{{text}}
// type: 返回类型，one of [html, xml, json]
// filter:文本过滤器，返回false时不发送请求
// parser: 结果转换器，必须返回数组[标题html, 正文html]
ShanbayChromeExtension._engineMeta = [
    {
      name : "扇贝词典",
      url : "http://www.shanbay.com/api/word/{{text}}",
      type : "json",
      filter : function(text) { // 长度<30且为英文
        if (text.length > 30) {
          return false;
        }
        for ( var i = 0; i < text.length; i++) {
          if (text.charCodeAt(i) > 128) {
            return false;
          }
        }
        return true;
      },
      parser : function(result) {
        if (typeof result.voc.id == "undefined") {
          return new Array("扇贝词典", "词典中没有找到选择的内容");
        }

        var caption = result.voc.content;
        if (result.voc.pron)
          caption += "[" + result.voc.pron + "]";
        caption += "&nbsp;";

        this.tmpCaption = caption;

        if (result.learning_id == 0) {
          this.result = result;
          
          // 添加单词链接的事件监听器
          var id = this._addHandler("add", "click", "funcAdd");
          caption += "<a href=\"#\" id=\"" + id + "\">[添加]</a>";
        } else {
          caption += "(已添加)";
        }

        var content = "<table><tr><td><pre>" + result.voc.definition
            + "</pre></td></tr></table>"

        return new Array(caption, content);
      },
      funcAdd : function() { // 添加单词
        var url = "http://www.shanbay.com/api/learning/add/"
            + this.result.voc.content;
        var thisEngine = this;
        $.getJSON(url, function(data) {
          if (data.id == 0) {
            $(thisEngine._captionDivSelector).append("&nbsp;(添加失败，请重试)");
          } else {
            $(thisEngine._captionDivSelector).html(
                thisEngine.tmpCaption + "(添加成功)");
          }
        });
      }
    },
    {
      name : "谷歌翻译",
      url : "http://translate.google.com/translate_a/t?client=t&text={{text}}&hl=en&sl=auto&tl=zh-CN&multires=1&otf=2&ssel=0&tsel=0&uptl=zh-CN&sc=1",
      type : "html",
      filter : function(text) {
        if (text.length > 1000) {
          return false;
        }
        return true;
      },
      parser : function(data) {
        var result = eval(data); // parseJSON doesn't work

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

// 鼠标停留在结果上时不响应鼠标弹起事件
ShanbayChromeExtension._isMouseOnDiv = false;

// 引擎
ShanbayChromeExtension._engines = new Array();

// 引擎类
ShanbayChromeExtension._Engine = function(id, meta) {
  // id: 在ShanbayChromeExtension._engines中的索引
  // meta: {name, url, parser} at least
  var attr;
  for (attr in meta) {
    this[attr] = meta[attr]
  }

  // 标题和内容的选择器
  var prefix = ShanbayChromeExtension._resultDivId + "_" + this.name;
  this._engineDivId = prefix;
  this._captionDivId = prefix + "_caption";
  this._contentDivId = prefix + "_content";

  prefix = "#" + prefix;
  this._engineDivSelector = prefix;
  this._captionDivSelector = prefix + "_caption";
  this._contentDivSelector = prefix + "_content";

  // 返回的内容需要绑定一些事件，如添加单词的点击事件
  this._handlers = {};

  if (typeof ShanbayChromeExtension._Engine._initialized == "undefined") {
    ShanbayChromeExtension._Engine._initialized = true;

    // 引擎的主要方法，查询并展示结果
    ShanbayChromeExtension._Engine.prototype._queryAndShow = function(text) {
      if (this.filter(text) == false) {
        return $(this._engineDivSelector).hide();
      }

      $(this._engineDivSelector).show();
      $(this._contentDivSelector).hide();
      var url = this.url.replace("{{text}}", text);
      var thisEngine = this; // hack "this" pointer
      $.get(url, null, function(data) {
        thisEngine._showResult(data);
        thisEngine._bindHandler();
      }, this.type);
    }

    // 转换查询结果并展示在自己的div中
    ShanbayChromeExtension._Engine.prototype._showResult = function(data) {
      var htmls = this.parser(data);
      $(this._captionDivSelector).html(htmls[0]);
      $(this._contentDivSelector).html(htmls[1]).slideDown("slow");
    }

    ShanbayChromeExtension._Engine.prototype._addHandler = function(idSuffix,
        event, handler) {
      var id = this._engineDivId + '_' + idSuffix;
      this._handlers[id] = [ event, handler ];
      return id;
    }

    ShanbayChromeExtension._Engine.prototype._bindHandler = function() {
      var id, event, handler;
      var thisEngine = this;
      for (id in this._handlers) { // event, handler
        $("#" + id).bind(this._handlers[id][0], function() {
          eval("thisEngine." + thisEngine._handlers[id][1] + "()");
        });
      }
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

  $(this._resultDivSelector).mouseover(function() {
    ShanbayChromeExtension._isMouseOnDiv = true;
  }).mouseout(function() {
    ShanbayChromeExtension._isMouseOnDiv = false;
  }).css({
    position : "absolute",
    display : "none",
    "z-index" : "100",
    overflow : "hidden",
    width : "500px",
    border : "solid 1px #209E85",
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
      "background-color" : "white"
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

  if (this._isMouseOnDiv == true) {
    return;
  }

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
    this._engines[i]._queryAndShow(text);
  }
}

$("body").ready(function() {
  ShanbayChromeExtension.initialize();
  $("body").mouseup(function(event) {
    ShanbayChromeExtension.onSelect(event);
  });
});
