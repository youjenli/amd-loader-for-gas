var require, define;
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
   
    const req = (reqList, callback) => {
        if (!reqList.splice) {
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

        callback = callback || doNothing;
        
        callback.apply(undef, reqList.map(callDep));
    };

    const def = (name, deps, factory) => {
        if (!isStr(name)) {
            throw new Error('Describing module name with an invalid type : ' + toStr.call(name));
        }
        if (name.length == 0) {
            throw new Error('Module name is empty.');
        }
        if (!modules[name]) {
            throw new Error('Attempt to redefine existing module "' + name + '".');
        }

        if (!deps.slice) {
            if (typeof deps !== 'function') {
                throw new Error('The format of definition about "' + name + '" is invalid.');
            } else {
                factory = deps;
                deps = [];
            }
        } else {
            for (let i = 0 ; i < deps.length ; i ++) {
                let dep = deps[i];
                if (!isStr(dep) || dep.length == 0) {
                    throw new Error('The argument of define call is invalid, index :' + i);
                }
            }
            if (typeof factory !== 'function') {
                throw new Error('The factory method type of "' + name + '" is not a function.');
            }
        }

        modules[name] = {
            id:name,
            factory: factory,
            dependencies: deps,
            exports: {},
            loaded: false
        };
    };

    req.noop = doNothing;
    def.amd = {};
   
    require = req;
    define = def;
}())