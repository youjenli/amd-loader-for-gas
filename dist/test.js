;
var require, define;
(function (undef) {
    const toStr = Object.prototype.toString;
    const modules = {}, doNothing = () => { };
    function isStr(value) {
        return toStr.call(value) === "[object String]";
    }
    const callDep = (pkgName) => {
        const definition = modules[pkgName];
        if (!definition) {
            throw new Error(`Asking for module "${pkgName}" which was not defined.`);
        }
        if (definition.loaded === true) {
            return definition.exports;
        }
        let isCjs = false;
        const depsOfModule = definition.dependencies.map(dep => {
            switch (pkgName) {
                case 'require':
                    return req;
                case 'exports':
                    isCjs = true;
                    return definition.exports;
                case 'module':
                    isCjs = true;
                    return definition;
                default:
                    return callDep(dep);
            }
        });
        const module = definition.factory.apply(undef, depsOfModule);
        if (!isCjs) {
            if (module === undef) {
                throw new Error(`The definition of "${pkgName}" has an undefined return value.`);
            }
            definition.exports = module;
        }
        definition.loaded = true;
        return definition.exports;
    };
    const req = (deps, ready) => {
        let reqList;
        if (!Array.isArray(deps)) {
            if (isStr(deps)) {
                reqList = [deps];
            }
            else {
                throw new Error('Asking for modules with an invalid argument type : ' + toStr.call(reqList));
            }
        }
        else {
            reqList = deps;
        }
        for (let i = 0; i < reqList.length; i++) {
            let req = reqList[i];
            if (!isStr(req)) {
                throw new Error('The argument of require call is invalid, index :' + i);
            }
            switch (req) {
                case 'require':
                case 'exports':
                case 'module':
                    throw new Error(`Asking for a module identified by reserved keyword "${req}".`);
            }
        }
        ready = ready || doNothing;
        ready.apply(undef, reqList.map(callDep));
    };
    const def = (name, depsOrReadyFunction, ready) => {
        if (!isStr(name)) {
            throw new Error('Describing module name with an invalid type : ' + toStr.call(name));
        }
        if (name.length == 0) {
            throw new Error('Module name is empty.');
        }
        if (modules.hasOwnProperty(name)) {
            throw new Error('Attempt to redefine existing module "' + name + '".');
        }
        let deps, readyFunc;
        if (!Array.isArray(depsOrReadyFunction)) {
            if (typeof depsOrReadyFunction !== 'function') {
                throw new Error('The format of definition about "' + name + '" is invalid.');
            }
            else {
                deps = [];
                readyFunc = depsOrReadyFunction;
            }
        }
        else {
            deps = depsOrReadyFunction;
            readyFunc = ready;
            for (let i = 0; i < depsOrReadyFunction.length; i++) {
                let dep = depsOrReadyFunction[i];
                if (!isStr(dep) || dep.length == 0) {
                    throw new Error('The argument of define call is invalid, index :' + i);
                }
            }
            if (typeof ready !== 'function') {
                throw new Error('The factory method type of "' + name + '" is not a function.');
            }
        }
        modules[name] = {
            id: name,
            factory: readyFunc,
            dependencies: deps,
            exports: {},
            loaded: false
        };
    };
    def.amd = {};
    require = req;
    define = def;
}());
const helloworld = 'helloworld';
const nameOfSimpleModule = 'simpleModule';
/// <reference path="./mock.ts" />
describe('The global define function of Amd loader', () => {
    test('should exists in global space', () => {
        expect(define).toBeDefined();
    });
    test('should have type "function"', () => {
        expect(typeof define).toBe('function');
    });
    const simpleModuleDef = jest.fn(() => {
        define(nameOfSimpleModule, [], () => {
            const module = {
                prop1: 'helloworld'
            };
            return module;
        });
    });
    test('should let user define module without any error', () => {
        expect(simpleModuleDef).not.toThrowError();
    });
    test('should throw error while use attempt to define existing module', () => {
        expect(simpleModuleDef).toThrowError();
    });
});
/// <reference path="./mock.ts" />
describe('The global require function of Amd loader', () => {
    it('should exists in global space', () => {
        expect(require).toBeDefined();
    });
    it('should have type "function"', () => {
        expect(typeof require).toBe('function');
    });
    it('should return simple module as the argument of ready function supplied to the require call.', done => {
        require(nameOfSimpleModule, (module) => {
            expect(Object.prototype.toString.call(module)).toBe('[object Object]');
            expect(module).toHaveProperty('prop1');
            expect(module.prop1).toBe(helloworld);
            done();
        });
    });
});
