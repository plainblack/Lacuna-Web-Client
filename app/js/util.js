'use strict';

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
