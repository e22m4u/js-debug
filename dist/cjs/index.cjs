var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DEFAULT_OFFSET_STEP_SPACES: () => DEFAULT_OFFSET_STEP_SPACES,
  INSPECT_OPTIONS: () => INSPECT_OPTIONS,
  createColorizedDump: () => createColorizedDump,
  createDebugger: () => createDebugger
});
module.exports = __toCommonJS(index_exports);

// src/create-debugger.js
var import_js_format = require("@e22m4u/js-format");
var import_js_format2 = require("@e22m4u/js-format");

// src/utils/is-non-array-object.js
function isNonArrayObject(input) {
  return Boolean(input && typeof input === "object" && !Array.isArray(input));
}
__name(isNonArrayObject, "isNonArrayObject");

// src/utils/generate-random-hex.js
function generateRandomHex(length = 4) {
  if (length <= 0) {
    return "";
  }
  const firstCharCandidates = "abcdef";
  const restCharCandidates = "0123456789abcdef";
  let result = "";
  const firstCharIndex = Math.floor(Math.random() * firstCharCandidates.length);
  result += firstCharCandidates[firstCharIndex];
  for (let i = 1; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * restCharCandidates.length);
    result += restCharCandidates[randomIndex];
  }
  return result;
}
__name(generateRandomHex, "generateRandomHex");

// src/create-colorized-dump.js
var import_util = require("util");
var INSPECT_OPTIONS = {
  showHidden: false,
  depth: null,
  colors: true,
  compact: false
};
function createColorizedDump(value) {
  return (0, import_util.inspect)(value, INSPECT_OPTIONS);
}
__name(createColorizedDump, "createColorizedDump");

// src/create-debugger.js
var AVAILABLE_COLORS = [
  20,
  21,
  26,
  27,
  32,
  33,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  56,
  57,
  62,
  63,
  68,
  69,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  92,
  93,
  98,
  99,
  112,
  113,
  128,
  129,
  134,
  135,
  148,
  149,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  178,
  179,
  184,
  185,
  196,
  197,
  198,
  199,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  209,
  214,
  215,
  220,
  221
];
var DEFAULT_OFFSET_STEP_SPACES = 2;
function pickColorCode(input) {
  if (typeof input !== "string")
    throw new import_js_format.Errorf(
      'The parameter "input" of the function pickColorCode must be a String, but %v given.',
      input
    );
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return AVAILABLE_COLORS[Math.abs(hash) % AVAILABLE_COLORS.length];
}
__name(pickColorCode, "pickColorCode");
function wrapStringByColorCode(input, color) {
  if (typeof input !== "string")
    throw new import_js_format.Errorf(
      'The parameter "input" of the function wrapStringByColorCode must be a String, but %v given.',
      input
    );
  if (typeof color !== "number")
    throw new import_js_format.Errorf(
      'The parameter "color" of the function wrapStringByColorCode must be a Number, but %v given.',
      color
    );
  const colorCode = "\x1B[3" + (Number(color) < 8 ? color : "8;5;" + color);
  return `${colorCode};1m${input}\x1B[0m`;
}
__name(wrapStringByColorCode, "wrapStringByColorCode");
function matchPattern(pattern, input) {
  if (typeof pattern !== "string")
    throw new import_js_format.Errorf(
      'The parameter "pattern" of the function matchPattern must be a String, but %v given.',
      pattern
    );
  if (typeof input !== "string")
    throw new import_js_format.Errorf(
      'The parameter "input" of the function matchPattern must be a String, but %v given.',
      input
    );
  const regexpStr = pattern.replace(/\*/g, ".*?");
  const regexp = new RegExp("^" + regexpStr + "$");
  return regexp.test(input);
}
__name(matchPattern, "matchPattern");
function createDebugger(namespaceOrOptions = void 0, ...namespaceSegments) {
  if (namespaceOrOptions && typeof namespaceOrOptions !== "string" && !isNonArrayObject(namespaceOrOptions)) {
    throw new import_js_format.Errorf(
      'The parameter "namespace" of the function createDebugger must be a String or an Object, but %v given.',
      namespaceOrOptions
    );
  }
  const withCustomState = isNonArrayObject(namespaceOrOptions);
  const state = withCustomState ? namespaceOrOptions : {};
  state.envNsSegments = Array.isArray(state.envNsSegments) ? state.envNsSegments : [];
  state.nsSegments = Array.isArray(state.nsSegments) ? state.nsSegments : [];
  state.pattern = typeof state.pattern === "string" ? state.pattern : "";
  state.hash = typeof state.hash === "string" ? state.hash : "";
  state.offsetSize = typeof state.offsetSize === "number" ? state.offsetSize : 0;
  state.offsetStep = typeof state.offsetStep !== "string" ? " ".repeat(DEFAULT_OFFSET_STEP_SPACES) : state.offsetStep;
  state.delimiter = state.delimiter && typeof state.delimiter === "string" ? state.delimiter : ":";
  if (!withCustomState) {
    if (typeof process !== "undefined" && process.env && process.env["DEBUGGER_NAMESPACE"]) {
      state.envNsSegments.push(process.env.DEBUGGER_NAMESPACE);
    }
    if (typeof namespaceOrOptions === "string")
      state.nsSegments.push(namespaceOrOptions);
  }
  namespaceSegments.forEach((segment) => {
    if (!segment || typeof segment !== "string")
      throw new import_js_format.Errorf(
        "Namespace segment must be a non-empty String, but %v given.",
        segment
      );
    state.nsSegments.push(segment);
  });
  if (typeof process !== "undefined" && process.env && process.env["DEBUG"]) {
    state.pattern = process.env["DEBUG"];
  } else if (typeof localStorage !== "undefined" && typeof localStorage.getItem("debug") === "string") {
    state.pattern = localStorage.getItem("debug");
  }
  const isDebuggerEnabled = /* @__PURE__ */ __name(() => {
    const nsStr = [...state.envNsSegments, ...state.nsSegments].join(
      state.delimiter
    );
    const patterns = state.pattern.split(/[\s,]+/).filter((p) => p.length > 0);
    if (patterns.length === 0 && state.pattern !== "*") return false;
    for (const singlePattern of patterns) {
      if (matchPattern(singlePattern, nsStr)) return true;
    }
    return false;
  }, "isDebuggerEnabled");
  const getPrefix = /* @__PURE__ */ __name(() => {
    let tokens = [];
    [...state.envNsSegments, ...state.nsSegments, state.hash].filter(Boolean).forEach((token) => {
      const extractedTokens = token.split(state.delimiter).filter(Boolean);
      tokens = [...tokens, ...extractedTokens];
    });
    let res = tokens.reduce((acc, token, index) => {
      const isLast = tokens.length - 1 === index;
      const tokenColor = pickColorCode(token);
      acc += wrapStringByColorCode(token, tokenColor);
      if (!isLast) acc += state.delimiter;
      return acc;
    }, "");
    if (state.offsetSize > 0) res += state.offsetStep.repeat(state.offsetSize);
    return res;
  }, "getPrefix");
  function debugFn(messageOrData, ...args) {
    if (!isDebuggerEnabled()) return;
    const prefix = getPrefix();
    if (typeof messageOrData === "string") {
      const multiString2 = (0, import_js_format2.format)(messageOrData, ...args);
      const rows2 = multiString2.split("\n");
      rows2.forEach((message) => {
        prefix ? console.log(`${prefix} ${message}`) : console.log(message);
      });
      return;
    }
    const multiString = createColorizedDump(messageOrData);
    const rows = multiString.split("\n");
    if (args.length) {
      args.forEach((message) => {
        prefix ? console.log(`${prefix} ${message}`) : console.log(message);
      });
      rows.forEach((message) => {
        message = `${state.offsetStep}${message}`;
        prefix ? console.log(`${prefix} ${message}`) : console.log(message);
      });
    } else {
      rows.forEach((message) => {
        prefix ? console.log(`${prefix} ${message}`) : console.log(message);
      });
    }
  }
  __name(debugFn, "debugFn");
  debugFn.withNs = function(namespace, ...args) {
    const stateCopy = JSON.parse(JSON.stringify(state));
    [namespace, ...args].forEach((ns) => {
      if (!ns || typeof ns !== "string")
        throw new import_js_format.Errorf(
          "Debugger namespace must be a non-empty String, but %v given.",
          ns
        );
      stateCopy.nsSegments.push(ns);
    });
    return createDebugger(stateCopy);
  };
  debugFn.withHash = function(hashLength = 4) {
    const stateCopy = JSON.parse(JSON.stringify(state));
    if (!hashLength || typeof hashLength !== "number" || hashLength < 1) {
      throw new import_js_format.Errorf(
        "Debugger hash must be a positive Number, but %v given.",
        hashLength
      );
    }
    stateCopy.hash = generateRandomHex(hashLength);
    return createDebugger(stateCopy);
  };
  debugFn.withOffset = function(offsetSize) {
    const stateCopy = JSON.parse(JSON.stringify(state));
    if (!offsetSize || typeof offsetSize !== "number" || offsetSize < 1) {
      throw new import_js_format.Errorf(
        "Debugger offset must be a positive Number, but %v given.",
        offsetSize
      );
    }
    stateCopy.offsetSize = offsetSize;
    return createDebugger(stateCopy);
  };
  debugFn.withoutEnvNs = function() {
    const stateCopy = JSON.parse(JSON.stringify(state));
    stateCopy.envNsSegments = [];
    return createDebugger(stateCopy);
  };
  return debugFn;
}
__name(createDebugger, "createDebugger");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_OFFSET_STEP_SPACES,
  INSPECT_OPTIONS,
  createColorizedDump,
  createDebugger
});
