


var newWord;

function checkLogin(){
	 chrome.cookies.get(
    {
        "url" : "http://shanbay.com",   //����������url ��:www.shanbay.com
        "name" : "userid"
    }, 
    function(cookie)
    {	if(cookie){
			userid = cookie.value;
			chrome.cookies.get(
			{
				"url" : "http://shanbay.com",
				"name" : "username"
			}, 
				function(cookie)
				 {	if(cookie)
					 username = cookie.value;
					 data='<span class="username"><a href="#" onclick="goURL(&quot;http://shanbay.com/user/list/'+userid+'/&quot;)">'+username+'</a></span>';
				     var res = document.getElementById('ubar');
					 res.innerHTML = data;
				 }
			);	
		}else{
			data='<span class="username"><a href="#" onclick="goURL(&quot;http://shanbay.com/accounts/login/&quot;)">��¼</a></span>';
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
				if(result){ //���ʴ���,��δ��¼��Ϊ�µ���
					audioElement.setAttribute('src', 'http://media.17bdc.com/sounds/'+word+'.mp3');
					//alert(result);
					re = /<div id="vocabulary-[\d]*" class="definition">.*?<\/div>/m ;
					result += re.exec(data);
					//alert(result);
					callback(result);
				}else{
					re = /<div id="search-fail">.*?<\/div>/m ;
					result =re.exec(data);
					if(result){ //���ʲ�����,��¼���δ��
						result += ('<input type="button" onclick="goURL(&quot;http://shanbay.com/search/fail/'+escape(word)+'/&quot;)" value="���" title="���Ϊ��������">');
						callback(result);
					}else{//���ʴ���,�ѵ�¼,���������
						//alert("�����������");
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
						'<span><a href="#" onclick="play_single_sound();"><img height="21" width="21" border="0" src="/img/SpeakerOffA20.png" title="����" ></a></span>');  //ʵ���Լ�����Ƶ����

	var res = document.getElementById('result');
	res.innerHTML = data;
	re = /vocabulary-([\d]*)/i   //javascript ��֧��(?<=exp) !!!
	var arrdata = data.match(re);
	
	var str = newWord?'��ӵ���':'��ϰ" title="��������Ѿ���ӹ�';
    if(arrdata[1]){
		res.innerHTML += ('<input type="button" onclick="goURL(&quot;http://shanbay.com/voc/save/'+arrdata[1]+'/&quot;)" value="'+str+'" >');
		}
	document.getElementById('word').focus();
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