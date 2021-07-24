interface Require{

    (modules:string[], ready?:Function): void;

}

interface RequireDefine {

    /**
        * Define a module with a name and dependencies.
        * @param name The name of the module.
        * @param ready Callback function when the dependencies are loaded.
        *    callback deps module dependencies
        *    callback return module definition
        **/
    (name: string, ready: Function): void;

    /**
    * Define a module with a name and dependencies.
    * @param name The name of the module.
    * @param deps List of dependencies module IDs.
    * @param ready Callback function when the dependencies are loaded.
    *    callback deps module dependencies
    *    callback return module definition
    **/
    (name: string, deps: string[], ready: Function): void;

    /**
    * Used to allow a clear indicator that a global define function (as needed for script src browser loading) conforms
    * to the AMD API, any global define function SHOULD have a property called "amd" whose value is an object.
    * This helps avoid conflict with any other existing JavaScript code that could have defined a define() function
    * that does not conform to the AMD API.
    */
     amd: Object;

}