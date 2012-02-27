

/********************************************************/

var newWord;

function query(word){
    document.body.style.height="100px";
    document.getElementsByTagName("html")[0].style.height="100px"; //神奇的是加了这句代码就可以自适应
    waitForQuery();
    word = trim(word).toLowerCase();
    handleJSONFromURL("http://www.shanbay.com/bdc/search/word/?word="+word,handleWord);
}


function handleWord(word){
    gWord=word;
    if(word&&word["result"]==0){//添加单词
	var w=document.createElement("div"); 
	var c =document.createElement("div");
	var other = document.createElement("div");
	//var i = document.createElement("div");	
	var t = document.createElement("span");//单词本体
	t.setAttribute("class", "wd");
	t.appendChild(document.createTextNode(word["content"]));
	w.appendChild(t);
	t = document.createElement("span");//音标
	t.setAttribute("class", "prn");
	if(word["pron"]!='')
	    t.innerHTML='['+word.pron+'] ';
	w.appendChild(t);

	if(word.audio){
	    t = document.createElement("img");//播放读音
	    t.setAttribute("src", "/img/SpeakerOffA20.png");
	    t.setAttribute("title", "发音");
	    var t1 =t ;
	    t =document.createElement("a");
	    t.setAttribute("href", "#");
	    t.setAttribute("onclick", "play_single_sound();");
	    t.appendChild(t1);
	    t1 = t;
	    t = document.createElement("span");
	    t.appendChild(t1);
	    w.appendChild(t);
	    var audioElement = document.getElementById('sound');
	    audioElement.removeAttribute('src');
	    audioElement.setAttribute('src', word.audio);
	}

	w.setAttribute("id", "word");
	    
	t=document.createElement("span");
	t.innerHTML=word["definition"].replace(/\n/g,"<br />"); //fixme
	t.setAttribute("class","content");
	c.appendChild(t);
	c.setAttribute("class","definition");
	
	t = document.createElement("input");
	t.setAttribute('id','interactive');
	t.setAttribute('type','button');
	// 未登录直接显示单词内容
	// if(!word.learning_id){
	//     t.onclick=function(){save(word)};
	//     t.setAttribute('value','添加单词');
	//     t.setAttribute('title','单击添加新词');
	//     i.appendChild(t);
	    
	// }else{
	//     t.onclick=function(){goURL('http://shanbay.com/learning/'+word.learning_id +'/')};
	//     t.setAttribute('value','查看');
	//     t.setAttribute('title','单击前往练习');
	//     var t1 = document.createElement('input');
	//     t1.setAttribute('type','button');
	//     t1.setAttribute('id','example');
	//     t1.setAttribute('value','添加例句');
	//     t1.setAttribute('title','为当前单词添加例句');
	//     t1.onclick=showExample;
	//     i.appendChild(t);
	//     i.appendChild(t1);
	// }
	//i.setAttribute('id','btns'); 

	other.appendChild(document.createElement('br'));
	other.setAttribute('id','other');
	
	result = document.getElementById('result');
	result.innerHTML='';
	result.appendChild(w);
	result.appendChild(c);
	result.appendChild(other);
	//
	
	//result.appendChild(i);
    }else{  //找不到单词
	result = document.getElementById('result');
	word = document.getElementsByName("word")[0].value; //damn
	result.innerHTML='你查找的单词<span class="highlight">'+word+'</span> 没有找到<br><br>' ; 
	//result.innerHTML+= ('<input type="button" onclick="goURL(&quot;http://shanbay.com/search/fail/'+escape(word)+'/&quot;)" value="添加" title="添加为短语或句子">');
    }
}

function handleJSONFromURL(url,handler){
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(data) {
	// alert(req.readyState+"  "+ req.status);
	if (req.readyState == 4) {
	    if (req.status == 200) {
		var data = req.responseText;
		var obj= data.parseJSON();
		handler(obj);
	    }
	}
}
    req.open('GET', url , true);
    req.send(null);
}



// 已过时 
// function query(word) {
//     document.body.style.height="100px";
//     document.getElementsByTagName("html")[0].style.height="100px";
//     waitForQuery()
//     var req = new XMLHttpRequest();
//     newWord=true;
//     word = trim(word).toLowerCase();
//     req.onreadystatechange = function(data) {
// 	if (req.readyState == 4) {
// 	    if (req.status == 200) {
// 		var audioElement = document.getElementById('sound');
// 		audioElement.removeAttribute('src');
// 		var data = req.responseText;
// 		data=data.replace(/\t|\n/g,"");
// 		re = /<div id="word">.*?<\/div>/m ;
// 		var result =re.exec(data);
// 		if(result){
// 		    audioElement.setAttribute('src', 'http://media.17bdc.com/sounds/'+word+'.mp3');
// 		    //alert(result);
// 		    re = /<div id="vocabulary-[\d]*" class="definition">.*?<\/div>/m ;
// 		    result += re.exec(data);
// 		    //alert(result);
// 		    writeToFrame(result);
// 		}else{
// 		    re = /<div id="search-fail">.*?<\/div>/m ;
// 		    result =re.exec(data);
// 		    if(result){
// 			result += ('<input type="button" onclick="goURL(&quot;http://shanbay.com/search/fail/'+escape(word)+'/&quot;)" value="添加" title="添加为短语或句子">');
// 			writeToFrame(result);
// 		    }else{
// 			newWord = false;
// 			var url = 'http://shanbay.com/vocabulary/' + word+'/';
// 			req.open('GET', url , true);
// 			req.send(null);
// 		    }
// 		}
// 	    }
// 	}
//     }
//     var url = 'http://shanbay.com/search?query_word=' + word;
//     req.open('GET', url , true);
//     req.send(null);
// }
// function writeToFrame(data){
//     data=data.replace(/<span class="sound">.*?<\/span>/,
// 		      '<span><a href="#" onclick="play_single_sound();"><img height="21" width="21" border="0" src="/img/SpeakerOffA20.png" title="发音" ></a></span>');  

//     var res = document.getElementById('result');
//     res.innerHTML = data;
//     re = /vocabulary-([\d]*)/i
//     var arrdata = data.match(re);
//     if(arrdata[1]){
// 	if(newWord){
// 	    res.innerHTML += ('<input id="interactive" type="button" onclick="saveWord(&quot;'+arrdata[1]+'&quot;)" value="添加单词" title="单击添加新词" >');
// 	}else{
// 	    res.innerHTML += ('<input id="interactive" type="button" onclick="goURL(&quot;http://shanbay.com/voc/save/'+arrdata[1]+'/&quot;)" value="已添加" title="单击前往练习" >');
// 	}

//     }
//     document.getElementById('word').focus();
// }


// function saveWord(id){
//     url = 'http://shanbay.com/voc/save/'+id;
//     res = document.getElementById('result');
//     d =  res.innerHTML;
//     waitForQuery();
//     if(logged){
//     var req = new XMLHttpRequest();
//     req.onreadystatechange = function(data) {
//           if (req.readyState == 4) {
//               if (req.status == 200) {
// 		  res.innerHTML = d;
// 		  btn =  document.getElementById('interactive');
// 		  if(btn){
// 		      btn.setAttribute("value", "已添加");
// 		      btn.setAttribute("title", "单击前往练习");
// 		      btn.setAttribute("onclick",'goURL("'+url+'")');
// 		      //btn.onclick = function(){
// 		      //  goURL(url);
// 		      //}
// 		  }

// 		  //res.onclick = function(){
		  
// 		  //}
// 	      }
// 	  }
//     }
//     req.open('GET', url , true);
//     req.send(null);
//     }else{
// 	goURL(url);
//     }
// }
// 
// function tryjson(){
//     Object.prototype.getName = function() { 
//    var funcNameRegex = /function (.{1,})\(/;
//    var results = (funcNameRegex).exec((this).constructor.toString());
//    return (results && results.length > 1) ? results[1] : "";
//     };
//     var req = new XMLHttpRequest();
//      req.onreadystatechange = function(data) {
// 	// alert(req.readyState+"  "+ req.status);
// 	if (req.readyState == 4) {
// 	    if (req.status == 200) {
// 		var data = req.responseText;
// 		var obj= data.parseJSON();
// 		alert(obj.voc["definition"]);
// //		alert(obj.toJSONString());
// 	    }
// 	}
// }
//     var url = 'http://shanbay.com/api/word/legacy';

//     req.open('GET', url , true);
//     req.send(null);
    
// }