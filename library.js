YAHOO.namespace("lacuna");
/*
indexOf is a recent addition to the ECMA-262 standard; as such it may not be present in all browsers. You can work around this by inserting the 
following code at the beginning of your scripts, allowing use of indexOf in implementations which do not natively support it. This algorithm is 
exactly the one used in Firefox and SpiderMonkey.
*/
if (!Array.prototype.indexOf) {  
	Array.prototype.indexOf = function(elt /*, from*/) {  
		var len = this.length >>> 0;  

		var from = Number(arguments[1]) || 0;  
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);  
		if (from < 0) {
			from += len;
		}

		for (; from < len; from++) {  
			if (from in this && this[from] === elt) { 
				return from;
			}
		}  
		return -1;  
	};  
} 
	
if (typeof YAHOO.lacuna.Library == "undefined" || !YAHOO.lacuna.Library) {
	
(function(){
	var Util = YAHOO.util,
		Lang = YAHOO.lang,
		Dom = Util.Dom;

	var xPad=function (x, pad, r) {
		if(typeof r === 'undefined') {
			r=10;
		}
		for( ; parseInt(x, 10)<r && r>1; r/=10) {
			x = pad.toString() + x;
		}
		return x.toString();
	};
		
	var Library = {
		AssetUrl : "http://localhost/lacuna/assets/",
		Styles : {
			HIDDEN : "hidden",
			ALERT : "alert"
		},
		ErrorCodes : {
			1000 : "Name not available",
			1001 : "Invalid password",
			1002 : "Object does not exist",
			1003 : "Too much information",
			1004 : "Password incorrect",
			1005 : "Contains invalid characters",
			1006 : "Authorization denied",
			1007 : "Overspend",
			1008 : "Underspend",
			1009 : "Invalid range",
			1010 : "Insufficient privileges",
			1011 : "Not enough resources in storage",
			1012 : "Not enough resources in production",
			1013 : "Missing prerequisites" 
		},
		View : {
			STAR : "star",
			SYSTEM : "system",
			PLANET : "planet"
		},
		QueueTypes : {
			PLANET : "1",
			STAR : "2",
			SYSTEM : "3"
		},
		

		formatTime : function(totalSeconds) {
			var secondsInHour = 60 * 60,
				hour = Math.floor(totalSeconds / secondsInHour),
				sleft = totalSeconds % secondsInHour,
				min = Math.floor(sleft / 60),
				seconds = sleft % 60;
			
			if(hour > 0) {
				return [hour,xPad(min,'0'),xPad(seconds,'0')].join(':');
			}
			else if(min > 0) {
				return [min,xPad(seconds,'0')].join(':');
			}
			else {
				return seconds;
			}
		},
		parseServerDate : function(strDate) {
			var pieces = strDate.split(' '), //[day, month, year, hr:min:sec, timez]
				time = pieces[3].split(':');
			//year, month, day, hours, minutes, seconds
			var dt = new Date(pieces[2]*1,(pieces[1]*1)-1,pieces[0]*1,time[0]*1,time[1]*1,time[2]*1,0);
			return dt;
			//"23 03 2010 01:20:11 +0000"
		},
		formatServerDate : function(strDate) {
			return Util.Date.format(Library.parseServerDate(strDate), {format:"%m/%d/%Y %r"}, "en");
		}
	};
	
	YAHOO.lacuna.Library = Library;
})();
YAHOO.register("library", YAHOO.lacuna.Library, {version: "1", build: "0"}); 

}