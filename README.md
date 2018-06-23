# app-mutex.ts
Application Mutex locker implementation for TypeScript 🐢


### Install

`yarn add app-mutex`

### Usage

```TypeScript
import { Mutex } from "app-mutext";

new Mutex("4cdb4d66-2d29-47fd-adaa-b2e8e72a6803", (status) => {
    switch (status) {
        case "CLEAR": break; // its ok
        case "PID_DEAD": // warning
            console.log("last time app ran, a critical error occurred.")
            break;
        case "CONFLICT":
            console.log("[ERR] app already running.");
            process.exit(-1);
            break;
    }
});


/* ... */

your code...

```
Then run your code in two instances, start only one. 😱



### Why use it

1. When you need to protect your system from running two or more instances of your program
2. When to know if your instance is running 😏

### License 
MIT
