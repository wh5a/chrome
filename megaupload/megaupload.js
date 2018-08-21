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
		var downloadlink = doc.getElementById("downloadlink"); // get all the elements with the element with id as downloadlink
		var href = downloadlink.firstChild.href; // take the first child and get the href element
		var p = href.lastIndexOf("/")      // taking out the last element after the / which is name of any object
		if (p!=-1) {  				// check if there is / in the above href i.e. there was linkwith something 
			var fileName = href.substring(p + 1);	// creates variable filemane with name of the original file on mega extratcted above
			fileName = fileName.replace("%20", " "); // replace html space code(%20) with space of string
			return fileName; 	// return the extracted filename
		} else {
			return "";		// other wise no file name was extracted
		}
	} catch(ex){
		return ""; 			// if exception was catched then return null file name 
	}
}
mgDownloadHelper.onLoad = function() 
{
	var doc = document;
	var downloadcounter = doc.getElementById("downloadcounter");   // getting all the elements with id downloadcounter
	if (downloadcounter) {   // if there exist element with downlaodcounter
		downloadcounter.style.display = 'none';			// dont show the element wich has id downloadcounter
		var downloadlink = doc.getElementById("downloadlink");   // getting all the elements with id downloadlink
		if (downloadlink) {				// if there exist element with download link
			downloadlink.hidden = true; // make downloadlink hidden
			if (downloadlink.firstChild) downloadlink.firstChild.style.display = 'none'; //if there is chil d of downloadlink then make it hidden
		}
			
		var folderPath = "";    // setting the path for download

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
			var countdown = doc.getElementById("countdown");		// get elements with countdoen
			confirmText.innerHTML = "Now you can continue browsing, the file will be downloaded automatically!<br>Your automatic download will start in <font style='font-size:12px;color:#df3f4e'><b>"+ countdown.innerHTML +"</b></font> seconds.";
			
			if (countdown.innerHTML == "1") { 			//if countdown elements is one the set timout to 1500ms
				var inaa = setTimeout(function() {
					var downloadlink = doc.getElementById("downloadlink");
					document.location = downloadlink.firstChild.href;
				}, 1500);
				clearInterval(ina)
			}
		},1000);   // sets timer for 1000ms 
	}
}

mgDownloadHelper.onLoad();			// calls on load function
