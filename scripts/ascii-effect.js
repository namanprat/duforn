import { CanvasTexture, Color, NearestFilter, RepeatWrapping, Texture, Uniform } from 'three';
import { Effect } from 'postprocessing';

const fragment = `
uniform sampler2D uCharacters;
uniform float uCharactersCount;
uniform float uCellSize;
uniform bool uInvert;
uniform vec3 uColor;
uniform float uOpacity;

const vec2 SIZE = vec2(16.);

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 greyscale(vec3 color, float strength) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), strength);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 cell = resolution / uCellSize;
    vec2 grid = 1.0 / cell;
    vec2 pixelizedUV = grid * (0.5 + floor(uv / grid));
    vec4 pixelized = texture2D(inputBuffer, pixelizedUV);
    float greyscaled = greyscale(pixelized.rgb).r;

    if (uInvert) {
        greyscaled = 1.0 - greyscaled;
    }

    float characterIndex = floor((uCharactersCount - 1.0) * greyscaled);
    vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
    vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
    vec2 charUV = mod(uv * (cell / SIZE), 1.0 / SIZE) - vec2(0., 1.0 / SIZE) + offset;
    vec4 asciiCharacter = texture2D(uCharacters, charUV);

    // Add grain to background
    float grain = random(uv * 2.0);
    vec3 grainColor = mix(pixelized.rgb, vec3(grain), 0.08);

    asciiCharacter.rgb = uColor * asciiCharacter.r * uOpacity;
    asciiCharacter.rgb = mix(asciiCharacter.rgb, vec3(grain), 0.05 * uOpacity);
    asciiCharacter.a = pixelized.a * asciiCharacter.a;
    outputColor = asciiCharacter;
}
`;

export class ASCIIEffect extends Effect {
    constructor({
        characters = ` .:,'-^=*+?!|0#%@`,
        fontSize = 10,
        cellSize = 32,
        color = '#ff1616ff',
        invert = false,
        fontFamily = 'secondary'
    } = {}) {
        const uniforms = new Map([
            ['uCharacters', new Uniform(new Texture())],
            ['uCellSize', new Uniform(cellSize)],
            ['uCharactersCount', new Uniform(characters.length)],
            ['uColor', new Uniform(new Color(color))],
            ['uInvert', new Uniform(invert)],
            ['uOpacity', new Uniform(1.0)]
        ]);

        super('ASCIIEffect', fragment, { uniforms });

        const charactersTextureUniform = this.uniforms.get('uCharacters');

        if (charactersTextureUniform) {
            charactersTextureUniform.value = this.createCharactersTexture(characters, fontSize, fontFamily);
        }
    }

    /** Draws the characters on a Canvas and returns a texture */
    createCharactersTexture(characters, fontSize, fontFamily) {
        const canvas = document.createElement('canvas');

        const SIZE = 1024;
        const MAX_PER_ROW = 16;
        const CELL = SIZE / MAX_PER_ROW;

        canvas.width = canvas.height = SIZE;

        const texture = new CanvasTexture(
            canvas,
            undefined,
            RepeatWrapping,
            RepeatWrapping,
            NearestFilter,
            NearestFilter
        );

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Context not available');
        }

        const draw = () => {
            context.clearRect(0, 0, SIZE, SIZE);
            context.font = `${fontSize}px "${fontFamily}", monospace`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = '#ff0000ff';

            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                const x = i % MAX_PER_ROW;
                const y = Math.floor(i / MAX_PER_ROW);

                context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
            }
            texture.needsUpdate = true;
        };

        // Try to load font, then draw
        document.fonts.load(`${fontSize}px "${fontFamily}"`).then(() => {
            draw();
        });

        // Initial draw
        draw();

        return texture;
    }
}
