import { IUniform } from "three";

export class Modifier<T> {
    defines: Record<string, any> = {};
    uniforms: Record<string, IUniform<T | null>> = {};
    bitFlag: number = 0;
    uniformName!: string;
    uniformValue: { value: T | null };

    constructor( value: T, uniformName: string ) {
        this.uniformValue = { value };
        this.uniformName = uniformName;
        this.uniforms[ this.uniformName ] = this.uniformValue;
    }

    get value(): T {
        return this.uniformValue.value as T;
    }

    set value( v: T ) {
        this.uniformValue.value = v;
    }

    update( deltaTime: number, runTime: number ) {}
}