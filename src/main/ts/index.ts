interface Require {

    /**
     * Load a module then executes a function which has the loaded module being as its argument.
     * @param mdule The id of module to load.
     * @param ready Called when required modules are ready.
     **/
    (module:string, ready?:(module:unknown) => void): void;

    /**
     * Load a list of module then executes a function which has loaded modules being as its argument.
     * @param modules List of IDs about modules to load.
     * @param ready Called when required modules are ready.
     **/
    (modules:string[], ready?:(...unknown) => void): void;

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

interface ModuleInfo {
    id:string,
    factory: (...unknown) => unknown,
    dependencies: string[],
    exports: unknown,
    loaded: boolean
};

var require:Require, define:RequireDefine;
(function (undef) {
    const toStr = Object.prototype.toString;
    const modules:{
        [key:string]:ModuleInfo
    } = {}, doNothing = () => {};

    function isStr(value) {
        return toStr.call(value) === "[object String]";
    }

    const callDep = (pkgName:string):unknown => {
        const definition:ModuleInfo = modules[pkgName];

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
   
    const req = (deps:string[]|string, ready?:(...unknown) => void) => {
        let reqList:string[];
        if (!Array.isArray(deps)) {
            if (isStr(deps)) {
                reqList = [deps];
            } else {
                throw new Error('Asking for modules with an invalid argument type : ' + toStr.call(reqList));
            }
        } else {
            reqList = deps;
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

        let deps:string[], readyFunc:() => void;
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
            factory: readyFunc,
            dependencies: deps,
            exports: {},
            loaded: false
        };
    };

    def.amd = {};
   
    require = req;
    define = def;
}())