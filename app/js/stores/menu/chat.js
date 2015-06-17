'use strict';

var Reflux = require('reflux');

var ChatActions = require('js/actions/menu/chat');

var ChatStore = Reflux.createStore({
    listenables: ChatActions,

    onShow: function() {
      this.trigger(true);
    }
});

module.exports = ChatStore;
