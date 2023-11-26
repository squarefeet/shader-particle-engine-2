const emitter = {
    spawn: {
        spawnRate: 1,
        burstRate: 1,
        maxAge: 1,
    },

    position: {
        origin: [ 0, 0, 0 ],
        distribution: {
            type: 'BOX',
            size: [ 50, 50, 50 ],
            spread: []
        },
    },

    velocity: {
        origin: [ 0, 0, 0 ],
        distribution: {
            type: 'BOX',
            size: [ 10, 10, 10 ],
            spread: [],
        },
        modifiers: [
            {
                type: 'MOD_ACCELERATION',
                value: [ 0, 10, 0 ],
            },
            {
                type: 'MOD_SIMPLEX_NOISE',
                params:[ 124, 0.001, 60.0, 0.5 ],
                scale: [ 1, 1, 1 ],
            },
            {
                type: 'MOD_ATTRACTOR',
                positions: [
                    [ 0, 10, 0 ],
                    [ 10, 0, 10 ],
                ],
                forces: [
                    15,
                    80,
                ],
            },
        ],
    },

    color: {
        texture: '',
        distribution: {
            type: 'VALUE_OVER_TIME',
            values: [
                [ 0, 0, 0, 0 ],
                [ 1, 1, 1, 0.5 ],
                [ 1, 0, 0, 0 ],
            ],
        },
    }
};


const a = new Emitter( ... )
    .addVelocityModifier( ... )
    .setPositionOrigin( 2, 4, 12 )
    .