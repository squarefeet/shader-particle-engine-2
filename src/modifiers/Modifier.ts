import { IUniform } from "three";

export class Modifier {
    defines: Record<string, any> = {};
    uniforms: Record<string, IUniform> = {};
}