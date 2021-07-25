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
    })
    it('should offer "require" function to global space', () => {
        expect(require).toBeDefined();
        expect(typeof require).toBe('function');
    });

    it('should throw error immediately if the user does not offer a name for the module he wants to define.', () => {
        const moduleDefWithoutModuleName = jest.fn(() => {
            //@ts-ignore
            define(() => {
                return simpleMockModule;
            });
        });
        expect(moduleDefWithoutModuleName).toThrowError();
        
    });

    it('should throw error immediately if the user provides an empty string as module name in module definition.', () => {
        const moduleDefWhichHasEmptyStringAsModuleName = jest.fn(() => {
            define('', [], () => {
                return simpleMockModule;
            });
        });
        expect(moduleDefWhichHasEmptyStringAsModuleName).toThrowError();
    });

    it('should throw error immediately if the user does not provide a function to define module.', () => {
        const moduleDefWhichHasEmptyStringAsModuleName = jest.fn(() => {
            //@ts-ignore
            define('', []);
        });
        expect(moduleDefWhichHasEmptyStringAsModuleName).toThrowError();
    });

    it('should throw error immediately when the user wants to get module "require" in require call.', () => {
        const requireRequireModule = jest.fn(() => {
            require(['require'], () => {
                //do nothing
            });
        });
        expect(requireRequireModule).toThrowError();
    });

    it('should throw error immediately when the user wants to get module "exports" in require call.', () => {
        const requireExportsModule = jest.fn(() => {
            require(['exports'], () => {
                //do nothing
            });
        });
        expect(requireExportsModule).toThrowError();
    });

    it('should throw error immediately when the user wants to get module "module" in require call.', () => {
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
        })
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

    test('can define module which depends on another module.', done => {
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
        expect(requireModuleWhichWasDefinedWithCjsObj).toThrowError();
    });
  
    test('will get an error immediately when he attempts to define a module whose name was used before.', () => {
        const defineModuleWhoseNameWasUsedBefore = jest.fn(() => {
            define(nameOfSimpleModule, [], () => {
                return simpleMockModule;
            });
        });
        expect(defineModuleWhoseNameWasUsedBefore).toThrowError();
    });

    test('will get an error immediately when he attempts to define a module with commonjs objects but ask for anything else to involve in the definition process.', () => {
        const nameOfModuleToBeDefinedWithCjsObj = 'nameOfModuleToBeDefinedWithCjsObj';
        
        const defineModuleWithCjsObj = jest.fn(() => {
            define(nameOfModuleToBeDefinedWithCjsObj, ['require', 'exports', 'module', 'simpleModule'], (req, exports, module, simpleModule) => {
                module.exports = {
                    name:'moduleDefinedWithCjsObjsButAsForAnotherModuleToInvolveInTheDefinitionProcess',
                    simpleModule:simpleModule
                }
            });
        });
        expect(defineModuleWithCjsObj).toThrowError();
    });
});
