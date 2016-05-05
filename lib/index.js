'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HandlebarsComponent = exports.registerComponents = exports.connect = undefined;

var _utils = require('./utils.js');

var _HandlebarsComponent = require('./HandlebarsComponent.js');

var _HandlebarsComponent2 = _interopRequireDefault(_HandlebarsComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.connect = _utils.connect;
exports.registerComponents = _utils.registerComponents;
exports.HandlebarsComponent = _HandlebarsComponent2.default;