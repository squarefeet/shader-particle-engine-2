import { Vector3 } from "three";
import { Distribution, DistributionType } from "./Distribution";

export class LineDistribution extends Distribution<Vector3> {
    type = DistributionType.LINE;
    constructor( min: Vector3, max: Vector3 ) {
        super( min, max );
    }
}
