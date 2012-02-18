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
 * 
 * 2012-2-16 MalFurion.StormRage@gmail.com
 * 实现Google Translate
 */

var ShanbayChromeExtension = {}

ShanbayChromeExtension.resultDivClass = "shanbay_extension_result_div";
ShanbayChromeExtension.resultDivSelector = ".shanbay_extension_result_div";

// 初始化展示结果用的层
ShanbayChromeExtension.initResultDiv = function() {
  resultDiv = document.createElement("div");
  resultDiv.className = this.resultDivClass;
  $("body").append(resultDiv);

  $(this.resultDivSelector).css({
    position : "absolute",
    display : "none",
    "background-color" : "yellow",
    color : "black",
    "z-index" : "100"
  });
}

// 获取选中的文本，如果无效，返回空
ShanbayChromeExtension.lastQuery = null;
ShanbayChromeExtension.getValidSelection = function() {
  // trim
  var text = String(window.getSelection()).replace(/(^\s*)|(\s*$)/g, "");

  // same word?
  if (this.lastQuery == text) {
    txt = "";
  } else {
    this.lastQuery = text;
  }

  return text;
}

// XHR查询翻译并将结果写入$(divid)中
ShanbayChromeExtension.queryAndShow = function(text) {
  var req = new XMLHttpRequest();
  var url = "http://translate.google.com/translate_a/t?"
      + "client=t&hl=zh-CN&sl=auto&tl=zh-CN&"
      + "multires=1&otf=1&ssel=0&tsel=0&sc=1&" + "text=" + text;

  // getJSON doesn't work, cause data is not a standard JSON string
  $.get(url, function(data) {
    // parseJSON doesn't work
    ShanbayChromeExtension.putResult(eval(data));
  });
}

// 将google translate翻译结果写入$(divid)中
ShanbayChromeExtension.putResult = function(result) {
  var summary = "";
  var i;

  if (!result[1]) {
    // 整句翻译
    for (i in result[0]) {
      summary += result[0][i][0];
    }

  } else {
    // 翻译一个单词，多种释义使用表格展示
    summary = "<table>";
    for (i in result[1]) {
      summary += "<tr><th style=\"background-color: lightgray;\">"
          + result[1][i][0] + "</th><td>" + result[1][i][1].join("；")
          + "</td></tr>";
    }
    summary += "</table>";
  }

  $(this.resultDivSelector).html(summary);
}

// 监听鼠标释放事件
ShanbayChromeExtension.onSelect = function(event) {
  if (event.button != 0)
    return;

  var txt = this.getValidSelection();
  if (!txt) {
    return $(this.resultDivSelector).fadeOut();
  }
  $(this.resultDivSelector).html("正在获取...").css({
    left : event.pageX + "px",
    top : event.pageY + 10 + "px"
  }).fadeIn();
  this.queryAndShow(txt, resultDiv.id);
}

$("body").ready(function() {
  ShanbayChromeExtension.initResultDiv();
  $("body").mouseup(function(event) {
    ShanbayChromeExtension.onSelect(event);
  });
});
