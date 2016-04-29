'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = connect;

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _nodeDeepcopy = require('node-deepcopy');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function connect(store, component) {
    var unsubscribe = null;

    var dispatch = function dispatch(action) {
        store.dispatch(action);
    };

    var handleStateChange = function handleStateChange() {
        component.setDispatch(dispatch);
        component.handleChange((0, _nodeDeepcopy.deepCopy)(store.getState()));
    };

    var trySubscribe = function trySubscribe(stateChangeHandler) {
        if (!unsubscribe) {
            unsubscribe = store.subscribe(handleStateChange);
            handleStateChange();
        }
    };

    trySubscribe();
}