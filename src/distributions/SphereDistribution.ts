import { Vector3 } from "three";
import { Distribution, DistributionType } from "./Distribution";

export class SphereDistribution extends Distribution<Vector3> {
    type = DistributionType.SPHERE;
    constructor( min: Vector3, max: Vector3 ) {
        super( min, max );
    }
}