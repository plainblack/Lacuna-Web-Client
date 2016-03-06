# Concepts

## Data Flow

```
    +---------+    +--------+    +------------------+
+-->| Actions |--->| Stores |--->| React Components |---+
|   +---------+    +--------+    +------------------+   |
|                                                       |
--------------------------------------------------------+
```

The most important concept to understand is how data is getting around the place. We're using [React](https://facebook.github.io/react/) and [Reflux](https://github.com/reflux/refluxjs#refluxjs) to do this. The way I came to understand this concept was through watching [this video](https://youtu.be/nYkdrAPrdcw?t=10m15s) and then reading through the React and Reflux documentation in a vain attempt to piece everything together.
