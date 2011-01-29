/*
Public Key:
53137d8f-3544-4118-9001-b0acbec70b3d
Private Key:
d07c9bd4-fcb7-427f-9064-218064677fef 
*/
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
if (!String.prototype.titleCaps) {
	String.small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
	String.punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
  
	String.prototype.titleCaps = function(replaceVal, withVal){
		var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0, processVal = this;
		var fnUpper = function(all){
				return (/[A-Za-z]\.[A-Za-z]/).test(all) ? all : String.upper(all);
			},
			fnPuntUpper = function(all, punct, word){
				return punct + String.upper(word);
			};
			
		if(replaceVal) {
			var rg = new RegExp(replaceVal, 'g');
			processVal = processVal.replace(rg, withVal || '');
		}
			
		while (true) {
			var m = split.exec(processVal);

			parts.push( processVal.substring(index, m ? m.index : processVal.length)
				.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, fnUpper)
				.replace(RegExp("\\b" + String.small + "\\b", "ig"), String.lower)
				.replace(RegExp("^" + String.punct + String.small + "\\b", "ig"), fnPuntUpper)
				.replace(RegExp("\\b" + String.small + String.punct + "$", "ig"), String.upper));
			
			index = split.lastIndex;
			
			if ( m ) { parts.push( m[0] ); }
			else { break; }
		}
		
		return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
			.replace(/(['Õ])S\b/ig, "$1s")
			.replace(/\b(AT&T|Q&A)\b/ig, function(all){
				return all.toUpperCase();
			});
	};
	String.lower = function(word){
		return word.toLowerCase();
	};
	String.upper = function(word){
	  return word.substr(0,1).toUpperCase() + word.substr(1);
	};
}
	
if (typeof YAHOO.lacuna.Library == "undefined" || !YAHOO.lacuna.Library) {
	
(function(){
	var Util = YAHOO.util,
		Lang = YAHOO.lang,
		Dom = Util.Dom,
		assetUrl = window.lacuna_s3_base_url + 'assets/';

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
		ApiKey : "53137d8f-3544-4118-9001-b0acbec70b3d",
		AssetUrl : assetUrl,
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
		
		formatInlineList : function(stringArray) {
			var offering = ['<ul class="inlineList">'];
			for(var n=0; n<stringArray.length; n++) {
				offering[offering.length] = '<li>';
				offering[offering.length] = stringArray[n];
				offering[offering.length] = '</li>';
			}
			offering[offering.length] = '</ul>';
			return offering.join('');
		},
		formatMillisecondTime : function(totalMs) {
			return Library.formatTime(totalMs / 1000);
		},
		formatTime : function(totalSeconds) {
			if(totalSeconds < 0) {
				return "";
			}
			
			var secondsInDay = 60 * 60 * 24,
				secondsInHour = 60 * 60,
				day = Math.floor(totalSeconds / secondsInDay),
				hleft = totalSeconds % secondsInDay,
				hour = Math.floor(hleft / secondsInHour),
				sleft = hleft % secondsInHour,
				min = Math.floor(sleft / 60),
				seconds = Math.floor(sleft % 60);
			
			if(day > 0) {
				return [day,xPad(hour,'0'),xPad(min,'0'),xPad(seconds,'0')].join(':');
			}
			else if(hour > 0) {
				return [hour,xPad(min,'0'),xPad(seconds,'0')].join(':');
			}
			else {
				return [min,xPad(seconds,'0')].join(':');
			}
		},
		formatNumber : function(num) {
			return Util.Number.format(num,{thousandsSeparator:","});
		},
		getTime : function(dt) {
			if(dt instanceof Date) {
				return dt.getTime();
			}
			else {
				return Library.parseServerDate(dt).getTime();
			}
		},
		parseServerDate : function(strDate) {
			if(strDate instanceof Date) {
				return strDate;
			}
			//"23 03 2010 01:20:11 +0000"
			var pieces = strDate.split(' '), //[day month year hr:min:sec timez]
				time = pieces[3].split(':');
			//year, month, day, hours, minutes, seconds
			/*var dt = new Date(pieces[2]*1,(pieces[1]*1)-1,pieces[0]*1,time[0]*1,time[1]*1,time[2]*1,0), //construct date
				msTime = dt.getTime(), //get dt in milliseconds
				offset = dt.getTimezoneOffset() * 60000, //get locale offset in milliseconds
				correctTime = msTime - offset, //subtract from UTC server time
				cd = new Date(correctTime);
			return cd;*/
			var dt = new Date();
			dt.setUTCFullYear(pieces[2]*1);
			dt.setUTCMonth((pieces[1]*1)-1,pieces[0]*1);
			dt.setUTCHours(time[0]*1);
			dt.setUTCMinutes(time[1]*1);
			dt.setUTCSeconds(time[2]*1);
			return dt;
		},
		parseReason : function(reason, defReason) {
			var output = "";
			if(reason) {
				if(Lang.isArray(reason)) {
					switch(reason[0]) {
						case 1011:
							output = [reason[1], ' Requires more ', (Lang.isArray(reason[2]) ? reason[2].join(', ') : reason[2])].join('');
							break;
						case 1012:
							if(reason[2]) {
								output = [reason[1], ' Requires higher production of ', (Lang.isArray(reason[2]) ? reason[2].join(', ') : reason[2])].join('');
							}
							else {
								output = reason[1];
							}
							break;
						case 1013:
							output = reason[1];
							break;
						default:
							output = defReason || reason[1];
							break;
					}
				}
				else {
					output = defReason || reason;
				}
			}
			return output;
		},
		formatServerDate : function(oDate) {
			var dt = oDate instanceof Date ? oDate : Library.parseServerDate(oDate);
			return Util.Date.format(dt, {format:"%m/%d/%Y %r"}, "en");
		},
		formatServerDateShort : function(oDate) {
			var dt = oDate instanceof Date ? oDate : Library.parseServerDate(oDate);
			return Util.Date.format(dt, {format:"%m/%d %r"}, "en");
		},
		formatServerDateShortTime : function(oDate) {
			var dt = oDate instanceof Date ? oDate : Library.parseServerDate(oDate);
			return Util.Date.format(dt, {format:"%m/%d/%Y %I:%M%p"}, "en");
		},
		formatServerDateTimeShort : function(oDate) {
			var dt = oDate instanceof Date ? oDate : Library.parseServerDate(oDate);
			return Util.Date.format(dt, {format:"%m/%d %I:%M%p"}, "en");
		},
		convertNumDisplay : function(number, always) {
			if(number >= 100000000 || number <= -100000000) {
				//101m
				return Math.floor(number/1000000) + 'm';
			}
			else if(number >= 1000000 || number <= -1000000) {
				//75.3m
				return (Math.floor(number/100000) / 10) + 'm';
			}
			else if(number >= 10000 || number <= -10000) {
				//123k
				return Math.floor(number/1000) + 'k';
			}
			else if(always) {
				//8765
				return Math.floor(number);
			}
			else {
				//8765
				return Math.floor(number) || "0";
			}
		},
		
		getSelectedOption : function(select) {
			//just making sure
			select = Dom.get(select);

			var opts = select.options,
				ind = select.selectedIndex;
			return ind >= 0 && opts.length > ind ? opts[ind] : null;
		},
		getSelectedOptionValue : function(select) {
			var opt = Library.getSelectedOption(select);
			return opt ? opt.value : null;
		},
		
		fadeOutElm : function(id) {
			var a = new Util.Anim(id, {opacity:{from:1,to:0}}, 4);
			a.onComplete.subscribe(function(e, dur, arg){
				Dom.get(arg).innerHTML = "";
				Dom.setStyle(arg, "opacity", 1);
			}, id);
			a.animate();
		},
		
		ResourceTypes : {
			"energy":1,
			"essentia":0,
			"food":["algae","apple","bean","beetle","burger","bread","cheese","chip","cider","corn","fungus","lapis","meal","milk","pancake","pie","potato","root","shake","soup","syrup","wheat"],
			"ore":["anthracite","bauxite","beryl","chromite","chalcopyrite","fluorite","galena","goethite","gold","gypsum","halite","kerogen","magnetite","methane","monazite","rutile","sulfur","trona","uraninite","zircon"],
			"waste":1,
			"water":1
		},
		Ships :  {
			bomber:"Bomber",
			cargo_ship:"Cargo Ship",
			colony_ship:"Colony Ship",
			detonator:"Detonator",
			dory:"Dory",
			drone:"Drone",
			excavator:"Excavator",
			fighter:"Fighter",
			freighter:"Freighter",
			gas_giant_settlement_platform_ship:"Gas Giant Settlement Platform Ship",
			mining_platform_ship:"Mining Platform Ship",
			observatory_seeker:"Observatory Seeker",
			probe:"Probe",
			scanner:"Scanner",
			scow:"Scow",
			security_ministry_seeker:"Security Ministry Seeker",
			smuggler_ship:"Smuggler Ship",
			snark:"Snark",
			space_station:"Space Station",
			spaceport_seeker:"Spaceport Seeker",
			spy_pod:"Spy Pod",
			spy_shuttle:"Spy Shuttle",
			terraforming_platform_ship:"Terraforming Platform Ship"
		},

        // planetarySort - Input: Game.EmpireData.planets, Output: A sorted array of planetary objects
        planetarySort : function(planets) {
            var newplanets = [];
            for(var pId in planets) {
                newplanets.push(planets[pId]);
            }
            newplanets.sort(function(a,b) {
				if (a.name > b.name) {
					return 1;
				}
				else if (a.name < b.name) {
					return -1;
				}
				else {
					return 0;
				}
            });
            return newplanets;
        }

	};
	
	YAHOO.lacuna.Library = Library;
})();
YAHOO.register("library", YAHOO.lacuna.Library, {version: "1", build: "0"}); 

}
