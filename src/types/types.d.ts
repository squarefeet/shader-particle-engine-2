import { Color, IUniform, Vector2, Vector3, Vector4 } from "three";

export type GLSLType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4';
export type GLSLTypeValue = number | Vector2 | Vector3 | Vector4 | Color;

export interface UniformComponentDefinition {
    setterName: string;
    component: 'x' | 'y' | 'z' | 'w';
    glslVariableName: string;
}

export interface UniformDefinition {
    name: string;
    type: GLSLType;
    pack?: boolean;
    value: GLSLTypeValue;
    components?: UniformComponentDefinition[];
}

export type ShaderUniformDefinitions = Record<string, UniformDefinition>;

export interface DefineDefinition {
    name: string;
    value: string | number;
}