import { Vector3 } from "three";
import { Distribution, DistributionType } from "./Distribution";

export class BoxDistribution extends Distribution<Vector3> {
    type = DistributionType.BOX;
    constructor( min: Vector3, max: Vector3 ) {
        super( min, max );
    }
}
