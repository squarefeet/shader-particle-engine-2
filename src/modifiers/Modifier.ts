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

    get value(): T | null {
        return this.uniformValue.value;
    }

    set value( v: T ) {
        this.uniformValue.value = v;
    }
}