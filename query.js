

/********************************************************/

var newWord;


function query(word) {
    document.body.style.height="100px";
    document.getElementsByTagName("html")[0].style.height="100px";
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
		    writeToFrame(result);
		}else{
		    re = /<div id="search-fail">.*?<\/div>/m ;
		    result =re.exec(data);
		    if(result){
			result += ('<input type="button" onclick="goURL(&quot;http://shanbay.com/search/fail/'+escape(word)+'/&quot;)" value="添加" title="添加为短语或句子">');
			writeToFrame(result);
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

function tryjson(){
    Object.prototype.getName = function() { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((this).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
    };
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(data) {
	// alert(req.readyState+"  "+ req.status);
	if (req.readyState == 4) {
	    if (req.status == 200) {
		var data = req.responseText;
		var obj= data.parseJSON();
		alert(obj.voc["definition"]);
//		alert(obj.toJSONString());
	    }
	}
}
    var url = 'http://shanbay.com/api/word/legacy';

    req.open('GET', url , true);
    req.send(null);
    
}