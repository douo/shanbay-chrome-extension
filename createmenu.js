function onClick(info, tab){
	// When user clicks on the menu item
	var existingNotifications =  chrome.extension.getViews({type:"notification"});
	for(var i = 0; i< existingNotifications.length ; i ++){
		var existing = existingNotifications[i];
		existing.close();
	};
	var notification = webkitNotifications.createHTMLNotification("popup.html");
	notification.ondisplay = function(){
		function callback(){
			var win = chrome.extension.getViews({type:"notification"})[0];
			console.log(info.selectionText);
			win.query(info.selectionText);
			var toHide = ["logo", "word", "search"];
			for(var i = 0; i< toHide.length ; i ++){
				var id = toHide[i];
				var elem = win.document.getElementById(id);
				//console.log(id);
				elem.setAttribute("style", "display:none");
			}
		};
		setTimeout(callback, 500);
	};
	notification.show();
	//console.log("Item was clicked");
}
var id = chrome.contextMenus.create({
	"title" : "使用扇贝查词",
    	"onclick" : onClick,
    	"contexts" : ["selection"]
}, function(){
	//console.log("Menu created");
});
