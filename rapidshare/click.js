var form = document.getElementById("ff");
// On the first landing page, click "Free User"
if (form) form.submit();
else
  // Revealing the download button is useless :(
  if (0) {
  var dl = document.getElementById("dl");
  // On the second countdown page, skip the counter
  if (dl) {
    // Since this extension lives in a separate world, we cannot simply set c, hence the following trick.
    // window.location = "javascript:c = 0;counta = 0;countb = 0;countc = 0;countd = 0;counte = 0;countf = 0;countg = 0;counth = 0;counti = 0;countj = 0;countk = 0;countl = 0;countm = 0;countn = 0;counto = 0;countp = 0;countq = 0;countr = 0;counts = 0;countt = 0;countu = 0;countv = 0;countw = 0;countx = 0;county = 0;countz = 0;";
    window.location = "javascript:c = 0;";
    // Wait for 1 second
    setTimeout(download(0), 1000);
  }
}

function findDlf() {
  var forms = document.forms;                      // forms is equal to forms present in document
  for (var i = 0; i < forms.length; i++)          // for loop from 0 to the length of array forms
    if (forms[i].getAttribute("name") == "dlf")   // check if name attribute of forms has dlf or not
      return forms[i];                        // return the forms[i] which has 'dlf' in name attribute of forms 
  return null;                            
}                     

// Try this several times
function download(count) {
  return function() {            
    var form = findDlf();                   
    // Our "c=0" hack reveals the download button, but the rapidshare server seems to keep a count too.
    // We still have to sit out the countdown to be able to download it.
    if (form) form.submit();        // if form then submit it
    else {                     // else if count >4 return download(count+1) after 1 second. i.e. execute 
      if (count > 4) return;     // the function again with count= count+1;
      setTimeout(download(count+1), 1000);
    }
  }
}
