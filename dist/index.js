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
        const depsOfModule = definition.dependencies.map(dep => {
            switch (pkgName) {
                case 'require':
                    return req;
                case 'exports':
                    return definition.exports;
                case 'module':
                    return definition;
                default:
                    return callDep(dep);
            }
        });
        const returnValue = definition.factory.apply(undef, depsOfModule);
        if (!definition.isCjsModule) {
            if (returnValue === undef) {
                throw new Error(`The define process of module "${pkgName}" has an undefined return value.`);
            }
            definition.exports = returnValue;
        }
        definition.loaded = true;
        return definition.exports;
    };
    const req = (deps, ready) => {
        let reqList;
        if (!Array.isArray(deps)) {
            if (isStr(deps)) {
                //當 deps 為字串時，將呼叫者視為在調用 commonjs 的 require 函式。
                return callDep(deps);
            }
            else {
                throw new Error('Asking for modules with an invalid argument type : ' + toStr.call(reqList));
            }
        }
        else {
            reqList = deps;
        }
        for (let i = 0; i < reqList.length; i++) {
            let module = reqList[i];
            if (!isStr(module)) {
                throw new Error('The argument of require call is invalid, index :' + i);
            }
            switch (module) {
                case 'require':
                case 'exports':
                case 'module':
                    throw new Error(`Asking for a module identified by reserved keyword "${module}".`);
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
        let deps, readyFunc, isCjsModule = false, hasDepsOtherThanCjsModuleGlobals = false;
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
            for (let i = 0; i < depsOrReadyFunction.length; i++) {
                let dep = depsOrReadyFunction[i];
                if (!isStr(dep) || dep.length == 0) {
                    throw new Error('The argument of define call is invalid, index :' + i);
                }
                switch (dep) {
                    case 'require':
                    case 'exports':
                    case 'module':
                        isCjsModule = true;
                        break;
                    default:
                        hasDepsOtherThanCjsModuleGlobals = true;
                        break;
                }
            }
            if (isCjsModule && hasDepsOtherThanCjsModuleGlobals) {
                throw new Error(`The module "${name}", which  was determined as a commonjs module because it depends on "require", "exports" or "module" object, has asked for other module in define call.`);
            }
            deps = depsOrReadyFunction;
            if (typeof ready !== 'function') {
                throw new Error('The factory method type of "' + name + '" is not a function.');
            }
            readyFunc = ready;
        }
        modules[name] = {
            id: name,
            factory: readyFunc,
            dependencies: deps,
            exports: {},
            loaded: false,
            isCjsModule: isCjsModule
        };
    };
    def.amd = {};
    require = req;
    define = def;
}());
