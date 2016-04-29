'use strict';

import _ from 'underscore';
import { deepCopy } from 'node-deepcopy';

export function connect(store, component) {
    let unsubscribe = null;

    let dispatch = function(action) {
        store.dispatch(action);
    };

    let handleStateChange = function() {
        component.setDispatch(dispatch);
        component.handleChange(deepCopy(store.getState()));
    };

    let trySubscribe = function(stateChangeHandler) {
        if (!unsubscribe) {
            unsubscribe = store.subscribe(handleStateChange);
            handleStateChange();
        }
    };

    trySubscribe();
}
