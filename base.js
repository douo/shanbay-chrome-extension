var logged;
function checkLogin(){
    chrome.cookies.get(
    {
        "url" : "http://shanbay.com",
        "name" : "userid"
    }, 
    function(cookie){
	if(cookie){
	    userid = cookie.value;
	    chrome.cookies.get(
		{
		    "url" : "http://shanbay.com",
		    "name" : "username"
		}, 
		function(cookie)
		{
		    if(cookie){
			username = cookie.value;
			logged=true;
			loadJS('jsonquery.js');
			data='<span class="username"><a href="#" onclick="goURL(&quot;http://shanbay.com/user/list/'+userid+'/&quot;)">'+username+'</a></span>';
			var res = document.getElementById('ubar');
			res.innerHTML = data;
		    }
		}
	    );	
	}else{
	    logged = false;
	    loadJS('query.js');
	    data='<span class="username"><a href="#" onclick="goURL(&quot;http://shanbay.com/accounts/login/&quot;)">登录</a></span>';
	    var res = document.getElementById('ubar');
	    res.innerHTML = data;
	    
	}
    }
    );
    document.getElementById('word').focus();
	
	/*var req = new XMLHttpRequest();
	req.onreadystatechange = function(data) {
          if (req.readyState == 4) {
            if (req.status == 200) {
				var data = req.responseText;
				re = /(<span class="username">)(.*?)<\/span>/gi
				var arrdata = data.match(re);
					alert(arrdata.length);
				for(var i = 0 ; i < arrdata.length; i++){
					alert(arrdata[i]);
				}
            }
          }
        }
	var url = 'http://shanbay.com';
	req.open('GET', url , true);
	req.send(null);*/
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
    oHead.appendChild( oScript); 

} 

Object.prototype.getName = function() { 
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec((this).constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};

