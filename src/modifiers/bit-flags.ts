// A quick-reference for modifier bit flags.
// These determine whether to perform a modifier calculation
// for a given emitter in the velocity shader, so having them
// here as a single source of truth is helpful for referring
// back to.
// They're also used within the Modifiers base class to set the
// uBitFlag uniform value.
export enum ModifierBitFlags {
    ACCELERATION =  1 << 0,
    DRAG =  1 << 1,
    SIMPLEX_NOISE =  1 << 2,
    ATTRACTOR =  1 << 3,
};