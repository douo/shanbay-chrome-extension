function onClick(info, tab){
	// When user clicks on the menu item
	// close all existing notifications
	function queryMyWindow(win){
		win.query(info.selectionText);
		var toHide = ["logo", "word", "search"];
		for(var i = 0; i< toHide.length ; i ++){
			var id = toHide[i];
			var elem = win.document.getElementById(id);
			elem.setAttribute("style", "display:none");
		}
	}
	var existingNotifications =  chrome.extension.getViews({type:"notification"});
	if(existingNotifications.length > 0){
		var win = existingNotifications[0];
		queryMyWindow(win);
	}else{
		// create a new one
		var notification = webkitNotifications.createHTMLNotification("popup.html");
		notification.addEventListener("display", function(){
			var win = null;
			waitAndQuery();
			function waitAndQuery(){
				if(win = chrome.extension.getViews({type:"notification"})[0]){
					console.log(info.selectionText);
					queryMyWindow(win);
				}else{
					setTimeout(waitAndQuery, 200);
				}
			}
		});
		notification.show();
	}
}
var id = chrome.contextMenus.create({
	"title" : "使用扇贝查词",
    	"onclick" : onClick,
    	"contexts" : ["selection"]
}, function(){
	console.log("Menu created");
});
