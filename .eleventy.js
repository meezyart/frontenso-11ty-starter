const Image = require('@11ty/eleventy-img');
const { RemoteAssetCache } = require('@11ty/eleventy-cache-assets');
const sizeOf = require('image-size');

const generateImageHTML = require('./generate-image-html');

function imageShortcode(src, attributes = {}, maxWidth = 2636) {
    console.log('src', src);
    if (typeof src != 'string') {
        throw new Error(`The path for the image is incorrect: ${src}`);
    }
    if (typeof maxWidth != 'number') {
        throw new Error(
            `\`maxWidth\` param should be of type number, received: ${maxWidth}`
        );
    }
    if (typeof attributes != 'object') {
        throw new Error('Image attributes should be of type `object`');
    }

    const widths = [295, 590, 1180, 1770, 2360];

    const originalFormat = src.split('.').pop();

    const options = {
        widths: [...widths.filter((v) => maxWidth - v >= 200), maxWidth],
        formats: ['avif', 'webp', originalFormat],
        urlPath: '/images/',
        outputDir: './dist/images/',
        sharpAvifOptions: {
            quality: 60,
            speed: 6,
        },
        sharpWebpOptions: {
            quality: 60,
            alphaQuality: 80,
        },
        sharpJpegOptions: {
            quality: 60,
        },
    };

    Image(src, options);

    const metadata = Image.statsSync(src, options);

    const firstMetadataObj = metadata[Object.keys(metadata)[0]];
    const maxWidthReal = firstMetadataObj.reduce((acc, curr) => {
        if (curr.width > acc) {
            return curr.width;
        }
        return acc;
    }, 0);

    const imageAttributes = {
        sizes: `(max-width: ${maxWidthReal}px) 100vw, ${maxWidthReal}px`,
        alt: '',
        loading: 'lazy',
        decoding: 'async',
        ...attributes,
    };

    return generateImageHTML(metadata, imageAttributes);
}

module.exports = (eleventyConfig) => {
    eleventyConfig.addPassthroughCopy({ 'src/public': '/' });

    eleventyConfig.setBrowserSyncConfig({
        files: [
            'dist/css/*.css',
            'dist/fonts/',
            'dist/*.html',
            'dist/images/*.avif',
            'dist/js/*.js',
        ],
        open: false,
    });

    eleventyConfig.addNunjucksShortcode('image', imageShortcode);

    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'components',
            layouts: '_layouts',
        },
        templateFormats: ['html', 'njk', 'md'],
        htmlTemplateEngine: 'njk',
    };
};