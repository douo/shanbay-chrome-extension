var version="0.3.1.4";
var logged;
var host="http://www.shanbay.com";



function init(){
    checkLogin();
    initOption();
}

  //使用属性初始化界面
function initOption() {
    if (typeof localStorage.options == "undefined") {
      localStorage.options = JSON.stringify({
        global : {
          enabled  : true,
          ctrlmask : false
        },
        shanbaydict : {
          enabled : true,
          autoadd : false,
          autoplay: true
        },
        googletran : {
          enabled : true
        },
        wikizh : {
          enabled : true
        },
        wikien : {
          enabled : true
        }
      })
    }

    var options = JSON.parse(localStorage.options);
  
    document.getElementById('selection_global_enabled').checked=options.global.enabled;
  }
  
function switchGlobalEnable() {
     var options = JSON.parse(localStorage.options);
     options.global.enabled = !options.global.enabled;
     document.getElementById('selection_global_enabled').checked= options.global.enabled;
     localStorage.options = JSON.stringify(options);
  }
  

function checkLogin(){
    chrome.cookies.get(
    {
        "url" : host,
        "name" : "userid"
    }, 
    function(cookie){
	if(cookie){
	    userid = cookie.value;
	    chrome.cookies.get(
		{
		    "url" : host,
		    "name" : "username"
		}, 
		function(cookie)
		{
		    if(cookie){
			username = cookie.value;
			logged=true;
			loadJS('jsonquery.js');
			data='<span class="username"><a href="#" onclick="goURL(&quot;'+host+'/user/list/'+username+'/&quot;)">'+username+'</a></span>';
			var res = document.getElementById('ubar');
			res.innerHTML = data;
		    }
		}
	    );	
	}else{
	    logged = false;
	    loadJS('query.js');
	    data='<span class="username"><a href="#" onclick="goURL(&quot;'+host+'/accounts/login/&quot;)">鐧诲綍</a></span>';
	    var res = document.getElementById('ubar');
	    res.innerHTML = data;
	    
	}
    }
    );
    document.getElementById('word').focus();
    //setTimeout(checkUpdate,500);
}
function checkUpdate(){
    var req = new XMLHttpRequest();
	req.onreadystatechange = function(data) {
          if (req.readyState == 4) {
            if (req.status == 200) {
		var data = req.responseText;
		if(data[0]=='1'){
		    document.getElementById('feedback').innerHTML= '&nbsp;<a style="color: red;" href="#" onclick="goURL(&quot;http://code.google.com/p/shanbay-chrome-extension/&quot;);">鏂扮増鏈琻ew!</a>';
		}else if(data[0]=='3'){
		    document.getElementById('foot').innerHTML=data.slice(1);
		}
            }
          }
        }
	var url = 'http://toys.dourok.info/sbce.php?version='+version;
	req.open('GET', url , true);
	req.send(null);
}

function goURL(url){
    window.open(url);
    window.self.close();
}

function play_single_sound() {
    //alert("playing");
    document.getElementById('sound').play();
    document.getElementById('word').focus();
}

//http://www.somacon.com/p355.php  or http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function waitForQuery(){
    var res = document.getElementById('result');
    res.innerHTML = '<br><img src="wait.gif">';
}


function loadJS(jsfile ) 

{ 
    var oHead = document.getElementsByTagName('HEAD').item(0); 
    var oScript= document.createElement("script"); 
    oScript.type = "text/javascript";
    oScript.src=jsfile; 
    oHead.appendChild(oScript); 

} 

Object.prototype.getName = function() { 
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec((this).constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};

