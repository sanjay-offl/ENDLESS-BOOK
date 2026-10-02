/**
 * svgo configuration for character-source.svg.
 *
 * svgo >= 4 loads this with a dynamic `import()`, so a `.json` config fails
 * with ERR_IMPORT_ATTRIBUTE_MISSING under Node >= 22. It also no longer
 * accepts inline JSON on `--config`, hence the .mjs file.
 *
 * Source config is deliberately CONSERVATIVE: the output is re-parsed and
 * re-split by scripts/extract-poses.py, so the document structure and the
 * viewBox have to survive intact.
 */
export default {
  multipass: false,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
          collapseGroups: false,
          mergePaths: false,
          convertShapeToPath: false,
          convertPathData: false,
          removeUselessStrokeAndFill: false,
        },
      },
    },
    "removeDimensions",
  ],
};
