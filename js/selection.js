/*
 * selection.js
 * 2012-2-19
 * 
 * 用于在网页中选择文本时弹出翻译或相关内容。
 * 需求所有网页权限。
 * 
 * ----ChangeLog----
 * TODO：
 * 自动添加（选项）
 * 
 * 2012-2-19 MalFurion.StormRage@gmail.com
 * 加入扇贝查词引擎，并实现添加生词
 * 加入维基百科引擎，抓取结果的第一段文本和第一张图片(如果有)
 * 为扇贝查词引擎加入登录判断
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
// filter: 文本过滤器，返回false时不发送请求，参数：(text选中的文本)
// parser: 结果转换器，请求成功返回时调用，必须返回数组[标题html, 正文html]，
// 参数：(data请求返回的数据)，类型由type指定
// 可选：
// error: 请求发生错误时调用，必须返回数组[标题html, 正文html]，参数：(status错误码, desc错误描述)
// 
// 元数据定义的函数中均可使用this指针获取当前的元数据，如this.name可获得引擎名
// this还额外提供了一些其他的属性：
// this.$text 当前查询的文本
// this.$captionDivSelector 标题div的选择器
// this.$contentDivSelector 内容div的选择器
// 
// 可为展示的结果提供点击事件处理器函数以完成某些操作，使用方法：
// var id = this.$addHandler(handlerName) //handlerName是元数据中提供的处理器函数名
// 将任意元素设置为这个id即可在点击时调用处理器函数，如：<a id="{{id}}" href="#">link</a>
// 处理器函数没有参数，可将一些数据放入this中，以便事件处理器函数使用。
// 处理器函数可通过jQuery访问选择器更新标题和内容。
// 参见扇贝词典中的处理器add实例。
// 
// this.$defaultError()方法用于返回默认的标题内容，可用于error的default分支中。
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
          return [ "扇贝词典", "词典中没有找到选择的内容" ];
        }

        var caption = result.voc.content;
        if (result.voc.pron)
          caption += "[" + result.voc.pron + "]";

        this.tmpCaption = caption;

        if (result.learning_id == 0) {
          this.result = result;

          // 添加单词链接的事件监听器
          var id = this.$addHandler("add");
          caption += "<a id=\"" + id + "\">[添加]</a>";
        } else {
          caption += "<span>已添加</span>";
        }

        var content = result.voc.definition.replace("\n", "<br/>")

        return [ caption, content ];
      },
      error : function(status) {
        switch (status) {
        case 200:
          return [
              "扇贝词典<a href=\"http://www.shanbay.com/accounts/login\" "
                  + "target=\"_blank\">[登录]<a>", "登录后才能查询" ];
        default:
          return this.$defaultError();
        }
      },
      add : function() { // 添加单词
        var url = "http://www.shanbay.com/api/learning/add/"
            + this.result.voc.content;
        var thisEngine = this;
        $.getJSON(url, function(data) {
          if (data.id == 0) {
            $(thisEngine.$captionDivSelector).append("<span>添加失败，请重试</span>");
          } else {
            $(thisEngine.$captionDivSelector).html(
                thisEngine.tmpCaption + "<span>添加成功</span>");
          }
        });
      }
    },
    {
      name : "谷歌翻译",
      url : "http://translate.google.com/translate_a/t?client=t&text={{text}}&hl=en&sl=auto&tl=zh-CN&multires=1&otf=2&ssel=0&tsel=0&uptl=zh-CN&sc=1",
      type : "html",
      filter : function(text) {
        if (text.length > 1000) { // 长度不超过1000且非中文 /^[\u4E00-\u9FA5]+$/
          return false;
        }
        if (/^[\u4E00-\u9FA5]+$/.test(text)) {
          return false;
        }
        return true;
      },
      parser : function(data) {
        var result = eval(data); // parseJSON doesn't work

        var caption = "谷歌翻译<a href=\"http://translate.google.com\" target=\"_blank\">[打开]</a>";
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

        return [ caption, content ];
      }
    },
    {
      name : "维基百科",
      url : "http://zh.wikipedia.org/wiki/{{text}}",
      type : "html",
      filter : function(text) {
        if (text.length > 30) {
          return false;
        }
        if (/\n/.test(text)) {
          return false;
        }
        return true;
      },
      parser : function(data) {
        var caption = "维基百科<a href=\"http://zh.wikipedia.org/wiki/"
            + this.$text + "\" target=\"_blank\">[查看详情]</a>";

        var left, right = null;
        if ($(data).find("#disambigbox").length != 0) { // 消歧义页
          left = $(data).find(".mw-content-ltr:first").children("ul:first")
              .html().replace(/<a[^>]*>|<\/a>/g, "");
        } else {
          var left = $(data).find(".mw-content-ltr:first").children("p:first")
              .text().replace(/\[[^\]]+\]/, "");
          var right = $(data).find(".infobox").find("td:first").find("a:first")
              .html();
        }

        if (!right)
          right = "";
        var content = "<table><tr><td>" + left + "</td><td>" + right
            + "</td></tr></table>";

        return [ caption, content ];
      },
      error : function(status) {
        switch (status) {
        case 404:
          var caption = "维基百科<a href=\"http://zh.wikipedia.org/wiki/"
              + this.$text + "\" target=\"_blank\">[前往编辑条目]</a>";
          return [ caption, "暂时没有这个条目" ];
        case 400:
          return [ "维基百科", "暂时没有这个条目" ];
        default:
          return this.$defaultError();
        }
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

// 鼠标停留在结果上时不响应鼠标弹起事件
ShanbayChromeExtension._isMouseOnDiv = false;

// 引擎
ShanbayChromeExtension._engines = new Array();

// 引擎类
ShanbayChromeExtension._Engine = function(id, meta) {
  // id: 在ShanbayChromeExtension._engines中的索引
  // meta: see ShanbayChromeExtension._engineMeta
  var attr;
  for (attr in meta) {
    this[attr] = meta[attr];
  }

  // 标题和内容的选择器
  var prefix = ShanbayChromeExtension._resultDivId + "_" + this.name;
  this._engineDivId = prefix;
  this._captionDivId = prefix + "_caption";
  this._contentDivId = prefix + "_content";

  prefix = "#" + prefix;
  this._engineDivSelector = prefix;
  this.$captionDivSelector = this._captionDivSelector = prefix + "_caption";
  this.$contentDivSelector = this._contentDivSelector = prefix + "_content";

  // 返回的内容需要绑定一些事件，如添加单词的点击事件
  this._handlers = {};
  // 查询的文本
  this.$text = null;

  if (typeof ShanbayChromeExtension._Engine._initialized == "undefined") {
    ShanbayChromeExtension._Engine._initialized = true;

    // error handler
    ShanbayChromeExtension._Engine.prototype._onError = function(xhr, type,
        cause) {
      this._xhr = xhr;
      this._errorType = type;
      this._errorCause = cause;

      if (typeof this.error == "undefined") {
        this._showResult(this.$defaultError());
      } else {
        this._showResult(this.error(xhr.status, cause));
      }
    }

    // default error message
    ShanbayChromeExtension._Engine.prototype.$defaultError = function() {
      return [ this.name,
          this._errorType + ": " + this._xhr.status + " " + this._errorCause ];
    }

    // 引擎的主要方法，查询并展示结果
    ShanbayChromeExtension._Engine.prototype._queryAndShow = function(text) {
      if (this.filter(text) == false) {
        return $(this._engineDivSelector).hide();
      }

      $(this._engineDivSelector).show();
      $(this._captionDivSelector).html(this.name + "<span>载入中...</span>");
      $(this._contentDivSelector).hide();
      var url = this.url.replace("{{text}}", text);
      this.$text = text;

      var thisEngine = this; // hack "this" pointer
      $.get(url, null, null, this.type).success(function(data) {
        thisEngine._parseAndShow(data);
        thisEngine._bindHandler();
      }).error(function(xhr, type, cause) {
        thisEngine._onError(xhr, type, cause);
      });
    }

    // 转换查询结果并展示在自己的div中
    ShanbayChromeExtension._Engine.prototype._parseAndShow = function(data) {
      this._showResult(this.parser(data));
    }

    ShanbayChromeExtension._Engine.prototype._showResult = function(htmls) {
      $(this._captionDivSelector).html(htmls[0]);
      content = htmls[1];
      if (!/<table.*<\/table>/.test(content)) {
        content = "<table><tr><td>" + content + "</td></tr></table>";
      }
      $(this._contentDivSelector).html(content).slideDown("slow");
    }

    ShanbayChromeExtension._Engine.prototype.$addHandler = function(handlerName) {
      var id = this._engineDivId + '_' + handlerName;
      this._handlers[id] = handlerName;
      return id;
    }

    ShanbayChromeExtension._Engine.prototype._bindHandler = function() {
      var id;
      var thisEngine = this;
      for (id in this._handlers) {
        $("#" + id).bind("click", function() {
          eval("thisEngine." + thisEngine._handlers[id] + "()");
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
    $(engine._captionDivSelector);

    contentDiv = document.createElement("div");
    contentDiv.id = engine._contentDivId;
    contentDiv.className = this._contentDivClass;
    $(engine._engineDivSelector).append(contentDiv);
    $(engine._contentDivSelector);
  }
}

// 获取选中的文本，如果无效，返回空
ShanbayChromeExtension._getValidSelection = function() {
  // trim
  var text = $.trim(String(window.getSelection()));

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

  var x = event.pageX;
  var ox = document.body.offsetWidth;
  if (x > 500 && ox - x < 500) {
    x -= 500;
  }

  $(this._resultDivSelector).css("left", x + "px").css("top",
      event.pageY + 10 + "px").fadeIn();

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
