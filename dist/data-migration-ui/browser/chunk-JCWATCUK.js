var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __reflectGet = Reflect.get;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b ||= {})
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __superGet = (cls, obj, key) => __reflectGet(__getProtoOf(cls), key, obj);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/@azure/msal-browser/dist/telemetry/BrowserPerformanceMeasurement.mjs
var BrowserPerformanceMeasurement = class _BrowserPerformanceMeasurement {
  constructor(name, correlationId) {
    this.correlationId = correlationId;
    this.measureName = _BrowserPerformanceMeasurement.makeMeasureName(name, correlationId);
    this.startMark = _BrowserPerformanceMeasurement.makeStartMark(name, correlationId);
    this.endMark = _BrowserPerformanceMeasurement.makeEndMark(name, correlationId);
  }
  static makeMeasureName(name, correlationId) {
    return `msal.measure.${name}.${correlationId}`;
  }
  static makeStartMark(name, correlationId) {
    return `msal.start.${name}.${correlationId}`;
  }
  static makeEndMark(name, correlationId) {
    return `msal.end.${name}.${correlationId}`;
  }
  static supportsBrowserPerformance() {
    return typeof window !== "undefined" && typeof window.performance !== "undefined" && typeof window.performance.mark === "function" && typeof window.performance.measure === "function" && typeof window.performance.clearMarks === "function" && typeof window.performance.clearMeasures === "function" && typeof window.performance.getEntriesByName === "function";
  }
  /**
   * Flush browser marks and measurements.
   * @param {string} correlationId
   * @param {SubMeasurement} measurements
   */
  static flushMeasurements(correlationId, measurements) {
    if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
      try {
        measurements.forEach((measurement) => {
          const measureName = _BrowserPerformanceMeasurement.makeMeasureName(measurement.name, correlationId);
          const entriesForMeasurement = window.performance.getEntriesByName(measureName, "measure");
          if (entriesForMeasurement.length > 0) {
            window.performance.clearMeasures(measureName);
            window.performance.clearMarks(_BrowserPerformanceMeasurement.makeStartMark(measureName, correlationId));
            window.performance.clearMarks(_BrowserPerformanceMeasurement.makeEndMark(measureName, correlationId));
          }
        });
      } catch (e) {
      }
    }
  }
  startMeasurement() {
    if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
      try {
        window.performance.mark(this.startMark);
      } catch (e) {
      }
    }
  }
  endMeasurement() {
    if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
      try {
        window.performance.mark(this.endMark);
        window.performance.measure(this.measureName, this.startMark, this.endMark);
      } catch (e) {
      }
    }
  }
  flushMeasurement() {
    if (_BrowserPerformanceMeasurement.supportsBrowserPerformance()) {
      try {
        const entriesForMeasurement = window.performance.getEntriesByName(this.measureName, "measure");
        if (entriesForMeasurement.length > 0) {
          const durationMs = entriesForMeasurement[0].duration;
          window.performance.clearMeasures(this.measureName);
          window.performance.clearMarks(this.startMark);
          window.performance.clearMarks(this.endMark);
          return durationMs;
        }
      } catch (e) {
      }
    }
    return null;
  }
};

export {
  __spreadValues,
  __spreadProps,
  __require,
  __objRest,
  __commonJS,
  __export,
  __toESM,
  __superGet,
  __async,
  BrowserPerformanceMeasurement
};
/*! Bundled license information:

@azure/msal-browser/dist/telemetry/BrowserPerformanceMeasurement.mjs:
  (*! @azure/msal-browser v4.15.0 2025-07-08 *)
*/
//# sourceMappingURL=chunk-JCWATCUK.js.map
