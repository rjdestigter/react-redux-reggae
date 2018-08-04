"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const ReactDOMServer = __importStar(require("react-dom/server"));
const redux_1 = require("redux");
const combineReggaeReducers_1 = __importDefault(require("../src/combineReggaeReducers"));
const ReggaeReducer_1 = __importDefault(require("../src/ReggaeReducer"));
const connect_1 = __importDefault(require("../src/connect"));
const reggaeifyStore_1 = __importDefault(require("../src/reggaeifyStore"));
exports.add = () => ({ type: 'ADD', payload: Math.random() });
exports.remove = () => ({ type: 'REMOVE' });
const initialState = {
    data: [],
    label: 'Example 1'
};
const State = {
    data: [],
    label: 'Example 2'
};
const reducer = (state = initialState, action) => {
    if (action.type === 'ADD') {
        return Object.assign({}, state, { data: [...state.data, action.payload] });
    }
    const [head, ...tail] = state.data;
    return Object.assign({}, state, { data: tail });
};
exports.reggae = ReggaeReducer_1.default.create(reducer);
exports.reggae2 = ReggaeReducer_1.default.create(reducer);
exports.combinedReggae = combineReggaeReducers_1.default({
    foo: exports.reggae,
    bar: exports.reggae2
});
const subscribers = [];
exports.store = redux_1.createStore(() => void 0);
reggaeifyStore_1.default(exports.store, exports.combinedReggae);
exports.reggae.subscribe(() => console.info('You ran REGGAE 1!'));
// reggae2.subscribe(() => console.info("You ran REGGAE 2!"));
exports.combinedReggae.subscribe(() => console.info('You ran COMBINED REGGAE!'));
class Foo extends React.PureComponent {
    render() {
        console.log('I rendered!');
        return 'Hello World';
    }
}
exports.Bar = connect_1.default(exports.reggae)(Foo);
ReactDOMServer.renderToString(React.createElement(exports.Bar));
