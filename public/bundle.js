/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var wavefront_obj_parser_1 = __webpack_require__(2);
var Model = (function () {
    function Model(wavefrontString) {
        var objJSON = wavefront_obj_parser_1.default(wavefrontString);
    }
    return Model;
}());
exports.default = Model;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Model_1 = __webpack_require__(0);
console.log(Model_1.default);


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = ParseWavefrontObj

// Map .obj vertex info line names to our returned property names
var vertexInfoNameMap = {v: 'vertex', vt: 'uv', vn: 'normal'}

function ParseWavefrontObj (wavefrontString) {
  'use strict'

  var parsedJSON = {normal: [], uv: [], vertex: [], normalIndex: [], uvIndex: [], vertexIndex: []}

  var linesInWavefrontObj = wavefrontString.split('\n')

  var currentLine, currentLineTokens, vertexInfoType, i, k

  // Loop through and parse every line in our .obj file
  for (i = 0; i < linesInWavefrontObj.length; i++) {
    currentLine = linesInWavefrontObj[i]
    // Tokenize our current line
    currentLineTokens = currentLine.split(' ')
    // vertex position, vertex texture, or vertex normal
    vertexInfoType = vertexInfoNameMap[currentLineTokens[0]]

    if (vertexInfoType) {
      for (k = 1; k < currentLineTokens.length; k++) {
        parsedJSON[vertexInfoType].push(parseFloat(currentLineTokens[k]))
      }
      continue
    }

    if (currentLineTokens[0] === 'f') {
      // Get our 4 sets of vertex, uv, and normal indices for this face
      for (k = 1; k < 5; k++) {
        // If there is no fourth face entry then this is specifying a triangle
        // in this case we push `-1`
        // Consumers of this module should check for `-1` before expanding face data
        if (k === 4 && !currentLineTokens[4]) {
          parsedJSON.vertexIndex.push(-1)
          parsedJSON.uvIndex.push(-1)
          parsedJSON.normalIndex.push(-1)
        } else {
          var indices = currentLineTokens[k].split('/')
          parsedJSON.vertexIndex.push(parseInt(indices[0], 10) - 1) // We zero index
          parsedJSON.uvIndex.push(parseInt(indices[1], 10) - 1) // our face indices
          parsedJSON.normalIndex.push(parseInt(indices[2], 10) - 1) // by subtracting 1
        }
      }
    }
  }

  return parsedJSON
}


/***/ })
/******/ ]);