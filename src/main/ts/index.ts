/// <reference path="./index.d.ts" />

var require:Require, define:RequireDefine;
(function (undef) {
    const toStr = Object.prototype.toString;
    const modules = {}, doNothing = () => {};

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
            switch(pkgName) {
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
    }
   
    const req = (reqList:string[], ready?:Function) => {
        if (!Array.isArray(reqList)) {
            if (isStr(reqList)) {
                reqList = [reqList];
            } else {
                throw new Error('Asking for modules with an invalid argument type : ' + toStr.call(reqList));
            }
        }

        for (let i = 0 ; i < reqList.length ; i ++) {
            let req = reqList[i];
            if(!isStr(req)){
                throw new Error('The argument of require call is invalid, index :' + i);
            }

            switch(req) {
                case 'require':
                case 'exports':
                case 'module':
                    throw new Error(`Asking for a module identified by reserved keyword "${req}".`);
            }
        }

        ready = ready || doNothing;
        
        ready.apply(undef, reqList.map(callDep));
    };

    const def = (name:string, depsOrReadyFunction:string[]|Function, ready?:Function) => {
        if (!isStr(name)) {
            throw new Error('Describing module name with an invalid type : ' + toStr.call(name));
        }
        if (name.length == 0) {
            throw new Error('Module name is empty.');
        }
        if (modules.hasOwnProperty(name)) {
            throw new Error('Attempt to redefine existing module "' + name + '".');
        }

        let deps:string[], readyFunc:Function;
        if (!Array.isArray(depsOrReadyFunction)) {
            if (typeof depsOrReadyFunction !== 'function') {
                throw new Error('The format of definition about "' + name + '" is invalid.');
            } else {
                deps = [];
                readyFunc = depsOrReadyFunction;
            }
        } else {
            deps = depsOrReadyFunction;
            readyFunc = ready;
            for (let i = 0 ; i < depsOrReadyFunction.length ; i ++) {
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
            id:name,
            factory: ready,
            dependencies: depsOrReadyFunction,
            exports: {},
            loaded: false
        };
    };

    def.amd = {};
   
    require = req;
    define = def;
}())