/*
 * Copyright (c) 2009
 *      Yevgeny Androv, yevgenyandrov@gmail.com. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * *) Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * *) Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 */
var mgDownloadHelper = {}
mgDownloadHelper.getFileName = function(doc) 
{
	try {
		var downloadlink = doc.getElementById("downloadlink");
		var href = downloadlink.firstChild.href;
		var p = href.lastIndexOf("/")
		if (p!=-1) {
			var fileName = href.substring(p + 1);
			fileName = fileName.replace("%20", " ");
			return fileName;
		} else {
			return "";
		}
	} catch(ex){
		return "";
	}
}
mgDownloadHelper.onLoad = function() 
{
	var doc = document;
	var downloadcounter = doc.getElementById("downloadcounter");
	if (downloadcounter) {
		downloadcounter.style.display = 'none';
		var downloadlink = doc.getElementById("downloadlink");
		if (downloadlink) {
			downloadlink.hidden = true;
			if (downloadlink.firstChild) downloadlink.firstChild.style.display = 'none';
		}

		var folderPath = "";

		doc.destFile = null;
		var div = doc.createElement("div");
		div.style.width = "290";
		div.style.marginLeft = "18px"
		div.style.marginTop  = "20px"

		var confirmText = doc.createElement("div");
		confirmText.innerHTML = "";
		confirmText.style.color = "#1a7e1e"
		confirmText.style.paddingTop = "2px";
		div.appendChild(confirmText);

		downloadcounter.parentNode.appendChild(div);

		var ina = setInterval(function() {
			var countdown = doc.getElementById("countdown");
			confirmText.innerHTML = "Now you can continue browsing, the file will be downloaded automatically!<br>Your automatic download will start in <font style='font-size:12px;color:#df3f4e'><b>"+ countdown.innerHTML +"</b></font> seconds.";
			
			if (countdown.innerHTML == "1") {
				var inaa = setTimeout(function() {
					var downloadlink = doc.getElementById("downloadlink");
					document.location = downloadlink.firstChild.href;
				}, 1500);
				clearInterval(ina)
			}
		},1000);
	}
}

mgDownloadHelper.onLoad();
