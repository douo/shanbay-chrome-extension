

var newWord;
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
			data='<span class="username"><a href="#" onclick="goURL(&quot;http://shanbay.com/user/list/'+userid+'/&quot;)">'+username+'</a></span>';
			var res = document.getElementById('ubar');
			res.innerHTML = data;
		    }
		}
	    );	
	}else{
	    logged = false;
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

function mainQuery(word,callback) {
    waitForQuery()
    var req = new XMLHttpRequest();
    newWord=true;
    word = trim(word).toLowerCase();
    req.onreadystatechange = function(data) {
	if (req.readyState == 4) {
	    if (req.status == 200) {
		var audioElement = document.getElementById('sound');
		audioElement.removeAttribute('src');
		var data = req.responseText;
		data=data.replace(/\t|\n/g,"");
		re = /<div id="word">.*?<\/div>/m ;
		var result =re.exec(data);
		if(result){
		    audioElement.setAttribute('src', 'http://media.17bdc.com/sounds/'+word+'.mp3');
		    //alert(result);
		    re = /<div id="vocabulary-[\d]*" class="definition">.*?<\/div>/m ;
		    result += re.exec(data);
		    //alert(result);
		    callback(result);
		}else{
		    re = /<div id="search-fail">.*?<\/div>/m ;
		    result =re.exec(data);
		    if(result){
			result += ('<input type="button" onclick="goURL(&quot;http://shanbay.com/search/fail/'+escape(word)+'/&quot;)" value="添加" title="添加为短语或句子">');
			callback(result);
		    }else{
			newWord = false;
			var url = 'http://shanbay.com/vocabulary/' + word+'/';
			req.open('GET', url , true);
			req.send(null);
		    }
		}
	    }
	}
    }
    var url = 'http://shanbay.com/search?query_word=' + word;
    req.open('GET', url , true);
    req.send(null);
}
function writeToFrame(data){
    data=data.replace(/<span class="sound">.*?<\/span>/,
		      '<span><a href="#" onclick="play_single_sound();"><img height="21" width="21" border="0" src="/img/SpeakerOffA20.png" title="发音" ></a></span>');  

    var res = document.getElementById('result');
    res.innerHTML = data;
    re = /vocabulary-([\d]*)/i
    var arrdata = data.match(re);
    if(arrdata[1]){
	if(newWord){
	    res.innerHTML += ('<input id="interactive" type="button" onclick="saveWord(&quot;'+arrdata[1]+'&quot;)" value="添加单词" title="单击添加新词" >');
	}else{
	    res.innerHTML += ('<input id="interactive" type="button" onclick="goURL(&quot;http://shanbay.com/voc/save/'+arrdata[1]+'/&quot;)" value="已添加" title="单击前往练习" >');
	}

    }
    document.getElementById('word').focus();
}


function saveWord(id){
    url = 'http://shanbay.com/voc/save/'+id;
    res = document.getElementById('result');
    d =  res.innerHTML;
    waitForQuery();
    if(logged){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(data) {
          if (req.readyState == 4) {
              if (req.status == 200) {
		  res.innerHTML = d;
		  btn =  document.getElementById('interactive');
		  if(btn){
		      btn.setAttribute("value", "已添加");
		      btn.setAttribute("title", "单击前往练习");
		      btn.setAttribute("onclick",'goURL("'+url+'")');
		      //btn.onclick = function(){
		      //  goURL(url);
		      //}
		  }

		  //res.onclick = function(){
		  
		  //}
	      }
	  }
    }
    req.open('GET', url , true);
    req.send(null);
    }else{
	goURL(url);
    }
}

function waitForQuery(){
    var res = document.getElementById('result');
    res.innerHTML = '<br><img src="wait.gif">';
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