const perlin = require('perlin-noise');
const options = {
    octaveCount: 5,
    amplitude: 0.3,
    persistence: 0.7
};
const fs = require('fs-extra');
const drawing = require('pngjs-draw');
const png = drawing(require('pngjs').PNG);
const RANGE = 100;
const noiseGround = perlin.generatePerlinNoise(RANGE, RANGE, options);//.map((el) => el * 100);
const noiseWater = perlin.generatePerlinNoise(RANGE, RANGE, options);//.map((el) => el * 100);

let currentX = 0;
let currentY = 0;
const arrayGround = [];
const arrayWater = [];
const toDb = [];

fs.createReadStream("blue.png")
    .pipe(new png({ filterType: 4}))
    .on('parsed', function() {
        for (let i; i < RANGE * RANGE; i++) {
            if (!arrayGround[currentX]) arrayGround[currentX] = [];
            if (!arrayWater[currentX]) arrayWater[currentX] = [];

            this.drawPixel(currentX, currentY, this.colors.new(el * 255, el * 255, el * 255));

            arrayGround[currentX][currentY] = noiseGround[i];
            arrayWater[currentX][currentY] = noiseWater[i];

            toDb.push({
                position: [currentX, currentY],
                fertility: noiseGround[i],
                water: noiseWater[i],
                fullSpace: 10,
                freeSpace: 10,
                sectors: {},
            });

            currentY++;
            if(currentY === RANGE) {
                currentY = 0;
                currentX++;
            }
        }

        this.pack().pipe(fs.createWriteStream('blue.out.png'));
    });
