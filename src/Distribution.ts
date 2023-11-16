import { Color, IUniform, Vector2, Vector3, Vector4 } from "three";

export type DistributionValue = number | Vector2 | Vector3 | Vector4 | Color;

export class Distribution {
    min: DistributionValue;
    max: DistributionValue;

    static dependencies: string[] = [
        'REQUIRE_RANDOM',
    ];

    constructor( min: DistributionValue, max: DistributionValue ) {
        if( min.constructor !== max.constructor ) {
            throw 'Distribution extents must be equal types';
        }

        this.min = min;
        this.max = max;
    }

    private randomNumberBetween( min: number, max: number ): number {
        const dist = max - min;
        return min + ( Math.random() * dist );
    }

    private getGLSLType(): string {
        if( typeof this.min === 'number' ) {
            return 'float';
        }

        if( this.min instanceof Vector2 ) {
            return 'vec2';
        }

        if( this.min instanceof Vector3 ) {
            return 'vec3';
        }

        // Vector4 and Color
        return 'vec4'; 
    }

    generateUniformDefinitions( prefix: string ): Record<string, IUniform> {
        return {
            [`u${prefix}Min`]: { value: this.min },
            [`u${prefix}Max`]: { value: this.max },
        };
    }

    generateGLSLUniforms( prefix: string ): string {
        const type = this.getGLSLType();

        return [
            `uniform ${type} u${prefix}Min`,
            `uniform ${type} u${prefix}Max`,
        ].join( '\n' );
    }

    generateGLSLCalculation( prefix: string, target: string ): string {
        return `${target} = genRandDistribution( seed, u${prefix}Min, u${prefix}Max  )`;
    }

    pickValue(): DistributionValue {
        if( this.min instanceof Vector2 && this.max instanceof Vector2 ) {
            return new Vector2(
                this.randomNumberBetween( this.min.x, this.max.x ),
                this.randomNumberBetween( this.min.y, this.max.y ),
            );
        }

        if( this.min instanceof Vector3 && this.max instanceof Vector3 ) {
            return new Vector3(
                this.randomNumberBetween( this.min.x, this.max.x ),
                this.randomNumberBetween( this.min.y, this.max.y ),
                this.randomNumberBetween( this.min.z, this.max.z ),
            );
        }

        if( this.min instanceof Vector4 && this.max instanceof Vector4 ) {
            return new Vector4(
                this.randomNumberBetween( this.min.x, this.max.x ),
                this.randomNumberBetween( this.min.y, this.max.y ),
                this.randomNumberBetween( this.min.z, this.max.z ),
            );
        }

        return this.randomNumberBetween( this.min as number, this.max as number );
    }
}

export class DistributionSphere {
    constructor( )
}