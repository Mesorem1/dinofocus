// Eagerly resolve all lazy globals installed by expo/src/winter/runtime.native.ts
// to avoid "import outside test scope" errors when getters are accessed after teardown.
const globalsToResolve = [
  'TextDecoder',
  'TextDecoderStream',
  'TextEncoderStream',
  'URL',
  'URLSearchParams',
  '__ExpoImportMetaRegistry',
  'structuredClone',
];
for (const name of globalsToResolve) {
  // eslint-disable-next-line no-unused-expressions
  void globalThis[name];
}
