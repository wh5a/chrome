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
var rsDownloadHelper = {}

rsDownloadHelper.onLoad = function() 
{

	var downloadcounter = document.getElementById("dl");
	if (downloadcounter) {
		var message = document.createElement("div");
		message.innerHTML = "Now you can continue browsing, the file will be downloaded automatically!<br>Your automatic download will start in <font style='font-size:12px;color:#df3f4e'><b</b></font> seconds.";
		downloadcounter.parentNode.insertBefore(message, downloadcounter);
		downloadcounter.style.display='none';

		var ina = setInterval(function() {
			var zeit = document.getElementById("zeit"); // selecting the element with Id zeit.
			var num = zeit.innerHTML.match(/[\d\.]+/g); // trying to match its inner html to text '/[\d\.]+/g'
			downloadcounter.style.display='none';     // set the display property of the DIV element to "none"
			message.innerHTML = "Now you can continue browsing, the file will be downloaded automatically!<br>Your automatic download will start in <font style='font-size:12px;color:#df3f4e'><b>"+ num[0] +"</b></font> seconds.";
                           //  change message HTML content
			if (num[0] == "1") {                  // if num is 1 then execute the if
				var inaa = setTimeout(function() {       // wait for 1.5s to execute the function
					var f = document.forms;         // f is equal to forms present in documents
					for (i=0;i<f.length;i++) {     
						if (f[i].name=="dlf") {  // if we find dlg in name in f then submit it.
							f[i].submit();
							return;
						}
					}
				}, 1500);
				clearInterval(ina)
			}
		},1000);    
	}

}
rsDownloadHelper.onLoad();
