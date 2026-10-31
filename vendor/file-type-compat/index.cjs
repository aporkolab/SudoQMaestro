'use strict';

// Jimp 0.22 uses the asynchronous pre-ESM API. Delegate parsing to patched upstream.
exports.fromBuffer = async buffer => (await import('file-type-modern')).fileTypeFromBuffer(buffer);
exports.fromFile = async path => (await import('file-type-modern')).fileTypeFromFile(path);
exports.fromStream = async stream => (await import('file-type-modern')).fileTypeFromStream(stream);
exports.fromTokenizer = async tokenizer => (await import('file-type-modern')).fileTypeFromTokenizer(tokenizer);
