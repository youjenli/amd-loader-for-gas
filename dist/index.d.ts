interface Require {
    /**
     * Load a module then executes a function which has the loaded module being as its argument.
     * @param mdule The id of module to load.
     * @param ready Called when required modules are ready.
     **/
    (module: string, ready?: (module: any) => void): void;
    /**
     * Load a list of module then executes a function which has loaded modules being as its argument.
     * @param modules List of IDs about modules to load.
     * @param ready Called when required modules are ready.
     **/
    (modules: string[], ready?: (...any: any[]) => void): void;
}
interface RequireDefine {
    /**
    * Define a module with a name and dependencies.
    * @param name The name of the module.
    * @param ready Callback function when the dependencies are loaded.
    *    callback deps module dependencies
    *    callback return module definition
    **/
    (name: string, ready: () => void): void;
    /**
    * Define a module with a name and dependencies.
    * @param name The name of the module.
    * @param deps List of dependencies module IDs.
    * @param ready Callback function when the dependencies are loaded.
    *    callback deps module dependencies
    *    callback return module definition
    **/
    (name: string, deps: string[], ready: (...any: any[]) => void): void;
    /**
    * Used to allow a clear indicator that a global define function (as needed for script src browser loading) conforms
    * to the AMD API, any global define function SHOULD have a property called "amd" whose value is an object.
    * This helps avoid conflict with any other existing JavaScript code that could have defined a define() function
    * that does not conform to the AMD API.
    */
    amd: Object;
}
interface ModuleInfo {
    id: string;
    factory: () => void;
    dependencies: string[];
    exports: {
        [key: string]: any;
    };
    loaded: boolean;
}
declare var require: Require, define: RequireDefine;
