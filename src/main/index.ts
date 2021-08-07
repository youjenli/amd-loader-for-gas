interface Require {

    /**
     * Load a module which is identified by the module name.
     * @param moduleName The name of module which was registered in previous define method call.
     * @returns The module
     */
    (moduleName:string):unknown;

    /**
     * Load a list of module then executes a function which has loaded modules being as its argument.
     * @param moduleNames List of IDs about modules to load.
     * @param ready Called when required modules are ready.
     **/
    (moduleNames:string[], ready?:(...unknown) => void): void;

}

interface RequireDefine {

    /**
    * Define a module with a name and dependencies.
    * @param name The name of the module.
    * @param ready Callback function when the dependencies are loaded.
    *    callback deps module dependencies
    *    callback return module definition
    **/
    (name: string, ready: () => unknown): void;

    /**
    * Define a module with a name and dependencies.
    * @param name The name of the module.
    * @param deps List of dependencies module IDs.
    * @param ready Callback function when the dependencies are loaded.
    *    callback deps module dependencies
    *    callback return module definition
    **/
    (name: string, deps: string[], ready: (...unknown) => unknown): void;

    /**
    * Used to allow a clear indicator that a global define function (as needed for script src browser loading) conforms
    * to the AMD API, any global define function SHOULD have a property called "amd" whose value is an object.
    * This helps avoid conflict with any other existing JavaScript code that could have defined a define() function
    * that does not conform to the AMD API.
    */
     amd: Object;

}

var require:Require, define:RequireDefine;
(function (undef) {
    const toStr = Object.prototype.toString;
    type ModuleInfo = {
        id:string,
        factory: (...unknown) => unknown,
        dependencies: string[],
        exports: unknown,
        loaded: boolean,
        pureAmdModule:boolean
    };
    const modules:{
        [key:string]:ModuleInfo
    } = {}, doNothing = () => {};

    function isStr(value) {
        return toStr.call(value) === "[object String]";
    }

    const callDep = (pkgName:string):unknown => {
        
        if (!pkgName) {
            throw new Error(`Asking for module "${pkgName}" which was not defined.`);
        }

        const moduleDef = modules[pkgName];

        if (moduleDef.loaded === true) {
            return moduleDef.exports;
        }

        const depsOfModule = moduleDef.dependencies.map(dep => {
            switch(dep) {
                case 'require':
                    return req;
                case 'exports':
                    return moduleDef.exports;
                case 'module':
                    return moduleDef;
                default:
                    return callDep(dep);
            }
        });
      
        const returnValue = moduleDef.factory.apply(undef, depsOfModule);
        if (moduleDef.pureAmdModule) {
            if (returnValue === undef) {
                throw new Error(`The define process of module "${pkgName}" has an undefined return value.`);
            }
            moduleDef.exports = returnValue;
        }
        moduleDef.loaded = true;
        return moduleDef.exports;
    }

    const req = (pkgNames:string[]|string, ready?:(...unknown) => void):unknown => {
        let deps:string[];
        if (!Array.isArray(pkgNames)) {
            if (isStr(pkgNames)) {
                //當 deps 為字串時，將呼叫者視為在調用 commonjs 的 require 函式。
                return callDep(pkgNames);
            } else {
                throw new Error('Asking for modules with an invalid argument type : ' + toStr.call(deps));
            }
        } else {
            deps = pkgNames;
        }

        const modules = deps.map((dep, idx) => {
            if(!isStr(dep)){
                throw new Error('The argument of require call is invalid, index :' + idx);
            }

            switch(dep) {
                case 'require':
                case 'exports':
                case 'module':
                    throw new Error(`Asking for a module which is identified by reserved keyword "${dep}".`);
                default:
                    return callDep(dep);
            }
        });

        ready = ready || doNothing;
        
        ready.apply(undef, modules);
    };

    const def = (name:string, depsOrReadyFunction:string[]|(() => void), ready?:() => void) => {
        if (!isStr(name)) {
            throw new Error('Describing module name with an invalid type : ' + toStr.call(name));
        }
        if (name.length == 0) {
            throw new Error('Module name is empty.');
        }
        if (modules.hasOwnProperty(name)) {
            throw new Error('Attempt to redefine existing module "' + name + '".');
        }

        ['require', 'exports', 'module'].forEach(preservedKeyword => {
            if (name == preservedKeyword) {
                throw new Error(`Defining module whose name is a reserved keyword : ${name}.`)
            }
        });

        let deps:string[], readyFunc:() => void, pureAmdModule:boolean = true;
        if (!Array.isArray(depsOrReadyFunction)) {
            if (typeof depsOrReadyFunction !== 'function') {
                throw new Error('The format of definition about "' + name + '" is invalid.');
            } else {
                deps = [];
                readyFunc = depsOrReadyFunction;
            }
        } else {
            for (let i = 0 ; i < depsOrReadyFunction.length ; i ++) {
                let dep = depsOrReadyFunction[i];
                if (!isStr(dep) || dep.length == 0) {
                    throw new Error('The argument of define call is invalid, index :' + i);
                }

                switch(dep) {
                    case 'require':
                    case 'exports':
                    case 'module':
                        pureAmdModule = false;
                }
            }
            deps = depsOrReadyFunction;

            if (typeof ready !== 'function') {
                throw new Error('The factory method type of "' + name + '" is not a function.');
            }
            readyFunc = ready;
        }

        modules[name] = {
            id:name,
            factory: readyFunc,
            dependencies: deps,
            exports: {},
            loaded: false,
            pureAmdModule: pureAmdModule
        };
    };

    def.amd = {};
   
    require = req;
    define = def;
}())