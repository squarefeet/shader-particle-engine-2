export enum TextureName {
    POSITION = 'position',
    VELOCITY = 'velocity',
    SPAWN = 'spawn',
}

export const TextureUniformName: Record<TextureName, string> = {
    [ TextureName.POSITION ]: 'tPosition',
    [ TextureName.VELOCITY ]: 'tVelocity',
    [ TextureName.SPAWN ]: 'tSpawn',
}