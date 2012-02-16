function $(id) {
  return document.getElementById(id);
}

function queryAndPutText(word, divid) {
  var req = new XMLHttpRequest();
  var url = "http://translate.google.com/translate_a/t?"
      + "client=t&hl=zh-CN&sl=auto&tl=zh-CN&"
      + "multires=1&otf=1&ssel=0&tsel=0&sc=1&" + "text=" + word;
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      putResult(divid, eval(req.responseText));
    }
  }
  req.open("GET", url, true);
  req.send(null);
}

function putResult(divid, result) {
  var summary = "";
  
  if (!result[1]) {
      for (i in result[0]) {
        summary += result[0][i][0];
      }
  } else {
    summary = "<table>";
    for (i in result[1]) {
      summary += "<tr><th style=\"background-color: lightgray;\">"
              + result[1][i][0]
              + "</th><td>"
              + result[1][i][1].join("；")
              + "</td></tr>";
    }
    summary += "</table>";
  }
  
  $(divid).innerHTML = summary;
}

function onSelect(event) {
  if (event.button != 0) return;
  if (!resultDiv) initResultDiv();
  
  var txt = getValidSelection();
  if (!txt) {
    resultDiv.style.display = "none";
    return;
  }
  
  resultDiv.innerHTML = "正在获取...";
  resultDiv.style.left = event.clientX + document.body.scrollLeft + "px";
  resultDiv.style.top = event.clientY + document.body.scrollTop + 10 + "px";
  resultDiv.style.display = "block";
  queryAndPutText(txt, resultDiv.id);
}

function getValidSelection() {
  var txt = String(window.getSelection()).replace(/(^\s*)|(\s*$)/g, "");
  return txt;
}

function initResultDiv() {
  resultDiv = document.createElement("div");
  resultDiv.id = "resultDiv";
  resultDiv.style.position = "absolute";
  resultDiv.style.display = "none";
  resultDiv.style.backgroundColor = "yellow";
  resultDiv.style.color = "black";
  document.body.appendChild(resultDiv);
}

var resultDiv = null;
window.addEventListener("mouseup", onSelect);
