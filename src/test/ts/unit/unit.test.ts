const helloworld = 'helloworld';

interface SimpleModule {
    prop1:typeof helloworld
}

const nameOfSimpleModule = 'simpleModule';
const simpleMockModule:SimpleModule = {
    prop1:'helloworld'
};
describe('The Amd loader', () =>{
    it('should offer "define" function to global space', () => {
        expect(define).toBeDefined();
        expect(typeof define).toBe('function');
    });
    
    it('should offer "require" function to global space', () => {
        expect(require).toBeDefined();
        expect(typeof require).toBe('function');
    });

    it('should throw an error immediately when the user does not offer a name for the module he wants to define.', () => {
        const moduleDefWithoutModuleName = jest.fn(() => {
            //@ts-ignore
            define(() => {
                return simpleMockModule;
            });
        });
        expect(moduleDefWithoutModuleName).toThrowError();
        
    });

    it('should throw an error immediately when the user provides an empty string as module name in module definition.', () => {
        const moduleDefWhichHasEmptyStringAsModuleName = jest.fn(() => {
            define('', [], () => {
                return simpleMockModule;
            });
        });
        expect(moduleDefWhichHasEmptyStringAsModuleName).toThrowError();
    });
    
    it('should throw an error immediately when the user wants to define a module whose name is one of a reserved keywords.', () => {
        const defineAModuleNamedRequire = jest.fn(() => {
            define('require', [] , () => {
                return false;
            });
        });
        expect(defineAModuleNamedRequire).toThrowError();
        const defineAModuleNamedExports = jest.fn(() => {
            define('exports', [] , () => {
                return false;
            });
        });
        expect(defineAModuleNamedExports).toThrowError();
        const defineAModuleNamedModule = jest.fn(() => {
            define('module', [] , () => {
                return false;
            });
        })
        expect(defineAModuleNamedModule).toThrowError();
    });

    it('should throw an error when the type of module name in definition is invalid.', () => {
        const defineModuleWithInvalidName = jest.fn(() => {
            //@ts-ignore
            define({ name:'helloworld'}, [], () =>{
                return simpleMockModule;
            });
        });
        expect(defineModuleWithInvalidName).toThrowError();
    });

    it('should throw an error when the type of any dependency is invalid.', () => {
        const defineModuleWithDependenyWhichHasInvalidType = jest.fn(() => {
            //@ts-ignore
            define('moduleWhoseDependenciesHasInvalidType', false, () => {
                return simpleMockModule;
            });
            //@ts-ignore
            define('anotherModuleWhoseDependenciesHasInvalidType', [{}, false, nameOfSimpleModule], () => {
                return simpleMockModule;
            });
        });
        expect(defineModuleWithDependenyWhichHasInvalidType).toThrowError();
    });

    it('should throw an error immediately when the user does not provide a function to define module.', () => {
        const moduleDefWhichHasEmptyStringAsModuleName = jest.fn(() => {
            //@ts-ignore
            define('', []);
        });
        expect(moduleDefWhichHasEmptyStringAsModuleName).toThrowError();
    });

    it('should throw an error immediately when the type of last argument of define function is not "function". ', () => {
        const moduleDefWhoseLastArgumentIsNotFunction = jest.fn(() => {
            //@ts-ignore
            define('moduleDefWhoseLastArgumentIsNotFunction', [], true);
        });
        expect(moduleDefWhoseLastArgumentIsNotFunction).toThrowError();
    });

    it('should throw an error immediately when the user wants to get module "require", "exports" or "module" in require call.', () => {
        const requireRequireModule = jest.fn(() => {
            require(['require'], () => {
                //do nothing
            });
        });
        expect(requireRequireModule).toThrowError();
        const requireExportsModule = jest.fn(() => {
            require(['exports'], () => {
                //do nothing
            });
        });
        expect(requireExportsModule).toThrowError();
        const requireModuleModule = jest.fn(() => {
            require(['module'], () => {
                //do nothing
            });
        });
        expect(requireModuleModule).toThrowError();
    });

});

describe('The user of amd loader', () => {

    test('can define module with "define" function and get the module with "require" function.', done => {
        const nameOfSimpleModule = 'simpleModule';
        const defineSimpleModule = jest.fn(() => {
            define(nameOfSimpleModule, [], () => {
                return simpleMockModule;
            });
        });
        expect(defineSimpleModule).not.toThrowError();        
        const requireSimpleModule = jest.fn(() => {
            require([nameOfSimpleModule], (simpleModule:SimpleModule) => {
                expect(simpleModule).toMatchObject(simpleMockModule);
                done();
            });
        });
        expect(requireSimpleModule).not.toThrowError();
    });

    test('should get the require function with commonjs style module definition', done => {
        const basicModuleName = 'basicModule';
        const basicModule = {
            name:'helloworld'
        }
        define(basicModuleName, ['require', 'exports'], (req, exports) => {
            expect(typeof req).toBe('function');
            const simpleModule = req(nameOfSimpleModule);
            expect(simpleModule).toMatchObject(simpleMockModule);
            exports.basic = basicModule;
        });
        require([basicModuleName], (module) => {
            expect(module.basic).toMatchObject(basicModule);
            done();
        });
    });

    test('will get the same instance of module with the same module name', () => {
        const requireSimpleModule = jest.fn(() => {
            require([nameOfSimpleModule], (simpleModule:SimpleModule) => {
                expect(simpleModule).toMatchObject(simpleMockModule);
            });
        })
        expect(requireSimpleModule).not.toThrowError();
        expect(requireSimpleModule).not.toThrowError();
        expect(requireSimpleModule).not.toThrowError();
    });

    test('can define module without specifying dependencies', done => {
        const nameOfAnotherInstanceOfSimpleModule = 'anotherInstanceOfSimpleModule';
        const defineAnotherInstanceOfSimpleModule = jest.fn(() => {
            define(nameOfAnotherInstanceOfSimpleModule, () => {
                return simpleMockModule;
            });
        });
        expect(defineAnotherInstanceOfSimpleModule).not.toThrowError();            
        const requireSimpleModule = jest.fn(() => {
            require([nameOfAnotherInstanceOfSimpleModule], (simpleModule:SimpleModule) => {
                expect(simpleModule).toMatchObject(simpleMockModule);
                done();
            });
        });
        expect(requireSimpleModule).not.toThrowError();
    });

    test('can define module which depends on other modules.', done => {
        const anotherModule = {
            key:'value'
        }
        const nameOfAnotherModule = 'anotherModule';
        const defineAnotherModule = jest.fn(() => {
            define(nameOfAnotherModule, [nameOfSimpleModule], (simpleModule:SimpleModule) => {
                expect(simpleModule).toMatchObject(simpleMockModule);
                return anotherModule;
            });
        });
        expect(defineAnotherModule).not.toThrowError();
        const requireAnotherModule = jest.fn(() => {
            require([nameOfAnotherModule], module => {
                expect(module).toMatchObject(anotherModule);
                done();
            });
        });
        expect(requireAnotherModule).not.toThrowError();
    });

    test('can define module with commonjs "require", "exports" and "module" object.', () => {
        const nameOfModuleToBeDefinedWithCjsObj = 'nameOfModuleToBeDefinedWithCjsObj';
        let moduleThatWasDefinedWithCjsObj;
        
        const defineModuleWithCjsObj = jest.fn(() => {
            define(nameOfModuleToBeDefinedWithCjsObj, ['require', 'exports', 'module'], (req, exports, module) => {
                const output = {
                    name:'helloworld',
                    simpleModule:req(nameOfSimpleModule)
                }
                moduleThatWasDefinedWithCjsObj = output;
                module.exports = output;
            });
        });
        expect(defineModuleWithCjsObj).not.toThrowError();
        const requireModuleWhichWasDefinedWithCjsObj = jest.fn(() => {
            require([nameOfModuleToBeDefinedWithCjsObj], (obj) => {
                expect(obj).toMatchObject(moduleThatWasDefinedWithCjsObj);
            });
        })
        expect(requireModuleWhichWasDefinedWithCjsObj).not.toThrowError();
    });
  
    test('will get an error immediately when he attempts to define a module whose name was used before.', () => {
        const defineModuleWhoseNameWasUsedBefore = jest.fn(() => {
            define(nameOfSimpleModule, [], () => {
                return simpleMockModule;
            });
        });
        expect(defineModuleWhoseNameWasUsedBefore).toThrowError();
    });

    test('will get an error if he request for a module which was not defined before', () => {
        const requestForModuleWhichWasNotDefined = jest.fn(() => {
            require(['moduleWhichWasNotDefined']);
        });
        expect(requestForModuleWhichWasNotDefined).toThrowError();
    });

    test('will get an error if the module definition function return "undefined".', () => {
        const aModuleWhoseValueIsUndefined = 'aModuleWhoseValueIsUndefined';
        define(aModuleWhoseValueIsUndefined, [], () => {
            return undefined;
        });
        const requireAModuleWhoseValueIsUndefined = jest.fn(() => {
            require([aModuleWhoseValueIsUndefined]);
        });
        expect(requireAModuleWhoseValueIsUndefined).toThrowError();
    });

    test('will get an error if the argument of require call has invalid type.', () => {
        const requireModuleWithInvalidType = jest.fn(() => {
            //@ts-ignore
            require({name:nameOfSimpleModule});
        });
        expect(requireModuleWithInvalidType).toThrowError();
        const requireModuleWithInvalidTypeInDeps = jest.fn(() => {
            //@ts-ignore
            require([nameOfSimpleModule, {name:nameOfSimpleModule}]);
        });
        expect(requireModuleWithInvalidTypeInDeps).toThrowError();
    });

    test('will get an error if he wants to get commonjs objects in require call', () => {
        const getRequireInRequire = jest.fn(() => {
            require(['require']);
        });
        expect(getRequireInRequire).toThrowError();
        const getExportsInRequire = jest.fn(() => {
            require(['exports']);
        })
        expect(getExportsInRequire).toThrowError();
        const getModuleObjInRequire = jest.fn(() => {
            require(['module']);
        })
        expect(getModuleObjInRequire).toThrowError();
    });

});
