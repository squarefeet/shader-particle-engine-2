import { Vector3 } from "three";

export enum DistributionType {
    NONE = 0,
    RANDOM = 1,
    BOX = 2,
    SPHERE = 3,
    LINE = 4,
}

export class Distribution<T> {
    min: T;
    max: T;
    type: DistributionType = DistributionType.NONE;

    constructor( min: T, max: T ) {
        this.min = min;
        this.max = max;
    }
}