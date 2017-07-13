![Screenshot][screenshot]
[screenshot]: public/screenshot.png
# WebGL Environment Mapping
***
An implementation of dynamic cube
mapping to render realistic looking
reflections in WebGL. This project runs
a Node server that serves script compiled
from TypeScript in the directory `src`

### To Build:
Make sure you have NodeJs and npm installed.
In order to build, run `npm install`
at the root of the project.

In the root of the directory you will find
a typings file for the node module `webgl-obj-loader`
which I use for parsing Wavefront OBJ files.
Once you have installed the dependencies please copy
`webgl-obj-loader.d.ts` implementation
`node_modules/webgl-obj-loader` as `index.d.ts`

Afterwards run `webpack` to finish the build.

### To Start:
Simply run `npm start` to start the server on port 3001
