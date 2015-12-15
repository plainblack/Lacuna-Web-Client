# Concepts

## Removal of YUI

The original client was implemented using Yahoo's user interface library  [YUI2](http://yui.github.io/yui2/docs/yui_2.9.0/docs/) which has been [depreciated since **2011**](http://yuiblog.com/blog/2011/04/13/announcing-yui-2-9-0/). Since April 2015 there has been an ongoing effort to eradicate the old (buggy) YUI code.

## Data Flow

```
    +---------+    +--------+    +------------------+
+-->| Actions |--->| Stores |--->| React Components |---+
|   +---------+    +--------+    +------------------+   |
|                                                       |
--------------------------------------------------------+
```

The most important concept to understand is how data is getting around the place. We're using [React](https://facebook.github.io/react/) and [Reflux](https://github.com/reflux/refluxjs#refluxjs) to do this. The way I came to understand this concept was through watching [this video](https://youtu.be/nYkdrAPrdcw?t=10m15s) and then reading through the React and Reflux documentation in a vain attempt to piece everything together.
