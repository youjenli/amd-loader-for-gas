import { echo, isModule, obj } from './myModule';

describe('A module loaded with amd loader', () => {
    it('can import echo function offered by external module.', () => {
        const msg = 'Start executing scripts in entry.';
        const value = echo(msg);
        expect(value).toBe(msg);
    });

    it('can import boolean value offered by external module.', () => {
        const bool = isModule;
        expect(bool).toBe(true);
    });

    it('can import object from external module', () => {
        const module = obj;
        expect(module.hasOwnProperty('key')).toBe(true);
    });
});
