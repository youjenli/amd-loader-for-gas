var require, define;
(function (undef) {
    const toStr = Object.prototype.toString;
    const modules = {}, doNothing = () => {};

    function isStr(value) {
        return toStr.call(value) === "[object String]";
    }

    const callDep = async (pkgName) => {
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
            definition.exports = module;
        }
        definition.loaded = true;
        return definition.exports;
    }
   
    const throwReservedModuleNameError = (name) => {
        throw new Error(`Asking for module identified by reserved keyword "${name}".`);
    }

    const req = async (reqList, callback) => {
        if (!reqList.splice) {
            if (isStr(reqList)) {
                reqList = [reqList];
            } else {
                throw new Error('Asking for modules with an invalid argument : ' + toStr.call(reqList));
            }
        }

        for (let req of reqList) {
            if(!isStr(req)){
                throw new Error('Asking for module with an invalid type : ' + toStr.call(req));
            }

            switch(req) {
                case 'require':
                case 'exports':
                case 'module':
                    throwReservedModuleNameError(req);
                    break;
            }
        }

        callback = callback || doNothing;
        
        callback.apply(undef, reqList.map(callDep));
    };

    const def = (name, deps, factory) => {
        if (!isStr(name)) {
            throw new Error('Describing module name with an invalid type : ' + toStr.call(name));
        }

        if (!modules[name]) {
            throw new Error('Module "' + name + '" is already defined');
        }

        if (!deps.slice) {
            if (typeof deps !== 'function') {
                throw new Error('The format of module "' + name + '" is invalid.');
            } else {
                factory = deps;
                deps = [];
            }
        } else if (typeof factory !== 'function') {
            throw new Error('The factory method type of module "' + name + '" is not a function.');
        }

        modules[id] = {
            id:id,
            factory: factory,
            dependencies: deps,
            exports: {},
            loaded: false
        };
    };

    req.noop = doNothing;
    def.amd = {};
    def.noop = doNothing;
    
    require = req;
    define = def;
}())