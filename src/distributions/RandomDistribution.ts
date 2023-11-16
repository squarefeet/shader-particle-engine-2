import { Distribution } from "./Distribution";

export class RandomDistribution extends Distribution {
    min: number;
    max: number;

    constructor( min: number, max: number ) {
        super();
        
        this.min = min;
        this.max = max;
    }
}