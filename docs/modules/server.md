# Server

This little module is for sending requests to the server. It should really only be used in stores.


```javascript

var server = require('js/server');

server.call({
    // Name of the module you want to access on the server. Examples: empire, body
    module: 'stats',

    // Name of the method you want to call on the server. Examples: get_status, is_namw_available
    method: 'credits',

    // Paramaters to send with the request. Can be an array or object depending on the request.
    params: [],

    // This option determines weather the session id should be automatically added into the
    // params. There are very few requests where the session id is not required, however,
    // to simplify code, you need to specify those times rather than it being auto-detected.
    addSession: false,

    // This function gets called when a request succeeds and is passed the resulting data.
    success: function(result) {
        // Note: the returned result is the result block of the returned data.
    },

    // Errors are shown to the user every time they occur. Therefore, this callback is only
    // required for component-specific error handling or whatever.
    error: function(error) {
        // Note: the passed in error object is the error object returned by the server.
    }
});
```
