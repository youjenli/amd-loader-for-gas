/// <reference path="./mock.ts" />
describe('The Amd loader', () =>{
    it('should have define function exists in global space', () => {
        expect(define).toBeDefined();
        expect(typeof define).toBe('function');
    })
    it('should have require function exists in global space', () => {
        expect(require).toBeDefined();
        expect(typeof require).toBe('function');
    });
});

describe('The user of amd loader', () => {
    const mockModule:SimpleModule = {
        prop1:'helloworld'
    };
    test('can define module with define function provided by amd loader', done => {//TODO
        define(nameOfSimpleModule, [], () => {
            return mockModule;
        });
        const requireSimpleModule = jest.fn(() => {
            require(nameOfSimpleModule, (simpleModule:SimpleModule) => {
                expect(simpleModule).toMatchObject(mockModule);
                done();
            });
        })
        expect(requireSimpleModule).not.toThrowError();
    });
    test('can define module without specifying dependencies', done => {
        const nameOfAnotherInstanceOfSimpleModule = 'anotherInstanceOfSimpleModule';
            define(nameOfAnotherInstanceOfSimpleModule, () => {
                return mockModule;
            });
        const requireSimpleModule = jest.fn(() => {
            require(nameOfAnotherInstanceOfSimpleModule, (simpleModule:SimpleModule) => {
                expect(simpleModule).toMatchObject(mockModule);
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
        define(nameOfAnotherModule, [nameOfSimpleModule], (simpleModule:SimpleModule) => {
            expect(simpleModule).toMatchObject(mockModule);
            return anotherModule;
        });
        const requireAnotherModule = jest.fn(() => {
            require(nameOfAnotherModule, module => {
                expect(module).toMatchObject(anotherModule);
                done();
            });
        });
        expect(requireAnotherModule).not.toThrowError();
    });
    test('should throw error immediately if the user did not offer module name.', () => {
        const moduleDefWithoutModuleName = jest.fn(() => {
            //@ts-ignore
            define(() => {
                return mockModule;
            });
        });
        expect(moduleDefWithoutModuleName).toThrowError();
        
    });
    test('should throw error immediately if the user provided an empty string as module name in module definition.', () => {
        const moduleDefWhichHasEmptyStringAsModuleName = jest.fn(() => {
            define('', [], () => {
                return mockModule;
            });
        });
        expect(moduleDefWhichHasEmptyStringAsModuleName).toThrowError();
    });
    test('should throw error immediately if the user attempt to define a module whose name was used before.', () => {
        const defineModuleWhoseNameWasUsedBefore = jest.fn(() => {
            define(nameOfSimpleModule, [], () => {
                return mockModule;
            });
        });
        expect(defineModuleWhoseNameWasUsedBefore).toThrowError();
    });
});
