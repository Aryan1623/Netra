module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // 👇 enable Hermes support for import.meta
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [],
  };
};
