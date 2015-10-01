'use strict';

var xPad=function (x, pad, r) {
    if(typeof r === 'undefined') {
        r=10;
    }
    for( ; parseInt(x, 10)<r && r>1; r/=10) {
        x = pad.toString() + x;
    }
    return x.toString();
};


module.exports.reduceNumber = function(number, always) {
    if(number >= 100000000000000000 || number <= -100000000000000000) {
        //101Q
        return Math.floor(number/1000000000000000) + 'Q';
    }
    else if(number >= 1000000000000000 || number <= -1000000000000000) {
        //75.3Q
        return (Math.floor(number/100000000000000) / 10) + 'Q';
    }
    else if(number >= 100000000000000 || number <= -100000000000000) {
        //101T
        return Math.floor(number/1000000000000) + 'T';
    }
    else if(number >= 1000000000000 || number <= -1000000000000) {
        //75.3T
        return (Math.floor(number/100000000000) / 10) + 'T';
    }
    else if(number >= 100000000000 || number <= -100000000000) {
        //101B
        return Math.floor(number/1000000000) + 'B';
    }
    else if(number >= 1000000000 || number <= -1000000000) {
        //75.3B
        return (Math.floor(number/100000000) / 10) + 'B';
    }
    else if(number >= 100000000 || number <= -100000000) {
        //101M
        return Math.floor(number/1000000) + 'M';
    }
    else if(number >= 1000000 || number <= -1000000) {
        //75.3M
        return (Math.floor(number/100000) / 10) + 'M';
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
};

module.exports.serverDateToMs = function(serverDate) {
    //"23 03 2010 01:20:11 +0000"
    var pieces = serverDate.split(' '), //[day month year hr:min:sec timez]
        time = pieces[3].split(':');
    var dt = new Date();
    dt.setUTCFullYear(pieces[2]*1);
    dt.setUTCMonth((pieces[1]*1-1), pieces[0]*1);
    dt.setUTCHours(time[0]*1);
    dt.setUTCMinutes(time[1]*1);
    dt.setUTCSeconds(time[2]*1);
    return dt.getTime();
};

module.exports.int = function(number) {
    return parseInt(number, 10);
};

module.exports.formatTime = function(totalSeconds) {
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
};

module.exports.formatMillisecondTime = function(ms) {
    return this.formatTime(ms / 1000);
};
