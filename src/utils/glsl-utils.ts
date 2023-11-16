import { Color, Vector2, Vector3, Vector4 } from "three";
import { DistributionValue } from "../Distribution";
import { ShaderUniformDefinitions } from "../types/types";

export function getTypeLength( type: DistributionValue ): number {
    switch( type.constructor ) {
        case Number:
            return 1;
        case Vector2:
            return 2;
        case Vector3: 
        case Color:
            return 3;
        case Vector4:
            return 4;
    }

    return 0;
}

export function getGLSLType( type: DistributionValue ): string {
    const typeLength = getTypeLength( type );

    switch( typeLength ) {
        case 1:
            return 'float';
        case 2:
            return 'vec2';
        case 3: 
            return 'vec3';
        case 4:
            return 'vec4';
    }

    return 'unknown';
}

export function getGLSLValueOpening( type: DistributionValue ): string {
    const typeLength = getTypeLength( type );

    switch( typeLength ) {
        case 1:
            return '';
        case 2:
            return 'vec2(';
        case 3: 
            return 'vec3(';
        case 4:
            return 'vec4(';
    }

    return '';
}

export function getGLSLValueClosing( type: DistributionValue ): string {
    const typeLength = getTypeLength( type );

    switch( typeLength ) {
        case 1:
            return '';
        case 2:
        case 3:
        case 4:
            return ')';
    }

    return '';
}

export function getGLSLValueString( type: DistributionValue ): string {
    const typeLength = getTypeLength( type );

    switch( typeLength ) {
        case 1:
            return type.toString();
        case 2:
        case 3:
        case 4:
            return ( type as Vector2 | Vector3 | Vector4 | Color ).toArray().toString();
    }

    return '';
}

export function getGLSLAssignment( type: DistributionValue ): string {
    const glslType = getGLSLType( type );
    const opening = getGLSLValueOpening( type );
    const value = getGLSLValueString( type );
    const closing = getGLSLValueClosing( type );
    const definition = [ opening, value, closing ].join( '' );
    
    return `${glslType} = ${definition};`;
}


export function generateGLSLUniformDefinitions( uniformDefinitions: ShaderUniformDefinitions ): string {
    const glslUniformDefinitionLines = Object.values( uniformDefinitions ).map( d => {
        return `uniform ${d.type} ${d.name};`;
    } );

    return glslUniformDefinitionLines.join( '\n' );
}