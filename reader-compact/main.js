/*
** Google Reader Compact
**
** Author........ : amio
** Created....... : Dec 16th, 2009
** Updated....... : Dec 16th, 2009
** Website....... : http://www.amio.cn/blog/
**
*/

function cssClassOps(a, o, c1, c2)
{
//	========== Vars:
//	a	defines the action you want the function to perform.
//	o	the object in question.
//	c1	the name of the first class.
//	c2	the name of the second class.
//
//	========== Possible actions(for var a):
//	swap	replaces class c1 with class c2 in object o.
//	add 	adds class c1 to the object o.
//	remove	removes class c1 from the object o.
//	check	test if class c1 is already applied to object o and returns true or false.
	switch (a) {
		case 'swap':
			o.className = !cssClassOps('check', o, c1, null) ? o.className.replace(c2, c1) : o.className.replace(c1, c2);
			break;
		case 'add':
			if (!cssClassOps('check', o, c1, null)) {
				o.className += o.className ? ' ' + c1 : c1;
			}
			break;
		case 'remove':
			var rep = o.className.match(' ' + c1) ? ' ' + c1 : c1;
			o.className = o.className.replace(rep, '');
			break;
		case 'check':
			return new RegExp('\\b' + c1 + '\\b').test(o.className);
			break;
	}
}

function switchCompact() {
	if (cssClassOps("check", document.body, "compactON", null)) {
		cssClassOps("swap", document.body, "compactON", "compactOFF");
	} else if (cssClassOps("check", document.body, "compactOFF", null)) {
		cssClassOps("swap", document.body, "compactOFF", "compactON");
	} else {
		alert("false");
	}
}

function addSwitchButton() {
	// creat the switch button
	var compactButton = document.createElement("a");
	compactButton.id = "compactButton";
	compactButton.title = "Switch between Compact View & Normal View.";
	compactButton.innerHTML = "<p></p>";
	compactButton.onclick = function(){switchCompact();};
	// incert the switch button
	var navDiv = document.getElementById("nav");
	if (navDiv) {
		navDiv.parentNode.insertBefore(compactButton, navDiv);
	}
}

function autoRun() {
	if(document.body){
		cssClassOps("add", document.body, "compactON", null);
	if (document.getElementById("nav")) {
		clearInterval(intervalID);
		addSwitchButton();
	}
	}
}

var intervalID = window.setInterval(autoRun(), 100);