/**
 * svgo configuration for the FINAL pose SVGs in
 * apps/web/public/character/poses/.
 *
 * These files are terminal artefacts - nothing re-parses them - so we can be
 * aggressive here and keep the characters light.
 *
 * NOTE on svgo >= 4: `removeViewBox` is no longer part of `preset-default`,
 * so it cannot be listed in `overrides` (svgo errors out). Omitting the
 * override is what we want anyway, since each pose is cropped purely by its
 * viewBox - if it were removed the pose would render as the full 750x500
 * sheet instead of the single framed figure.
 *
 * `cleanupIds` also stays off so per-path animation hooks can be added later.
 */
export default {
  multipass: true,
  js2svg: { pretty: false },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          cleanupIds: false,
        },
      },
    },
    "removeDimensions",
    "reusePaths",
  ],
};
