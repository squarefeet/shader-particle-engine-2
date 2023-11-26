import { TypedArray, Vector3 } from "three";

export type TypedArrayConstructor = new ( size: number ) => TypedArray;

export function resizeTypedArray( array: TypedArray, newSize: number ): TypedArray {
    const currentSize = array.length;

    if( newSize < currentSize ) {
        return shrinkTypedArray( array, newSize );
    }
    else if( newSize > currentSize ) {
        return growTypedArray( array, newSize );
    }

    return array;
}

export function shrinkTypedArray( array: TypedArray, newSize: number ): TypedArray {
    return array.subarray( 0, newSize );
}

export function growTypedArray( array: TypedArray, newSize: number ): TypedArray {
    const newArray = new ( array.constructor as TypedArrayConstructor )( newSize );
    
    newArray.set( array );

    return newArray;
}

export function setVec3AtIndex(
    array: TypedArray,
    index: number,
    vector: Vector3
): void {
    setVec3ComponentsAtIndex( array, index, vector.x, vector.y, vector.z );
}

export function setVec3ComponentsAtIndex(
    array: TypedArray,
    index: number,
    x: number,
    y: number,
    z: number
): void {
    array[ index + 0 ] = x;
    array[ index + 1 ] = y;
    array[ index + 2 ] = z;
}