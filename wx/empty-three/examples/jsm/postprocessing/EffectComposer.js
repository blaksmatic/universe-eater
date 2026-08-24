// Postprocessing stubs for the WeChat Mini Game build.
// The real modules are only loaded in the browser via dynamic import;
// initComposer's try/catch degrades gracefully when these are used instead.
function StubCtor() {}
StubCtor.prototype = {};
module.exports = { EffectComposer: StubCtor };
