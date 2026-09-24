const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

/**
 * Splits text around URLs, returning an array of {text} and {url} parts so a
 * component can render plain text alongside real <a> links — used for
 * message bodies, which are stored as plain text with no rich formatting.
 * A capturing group in split() interleaves [text, match, text, match, ...],
 * so odd indices are always the matched URLs — safer than re-testing a
 * shared `/g` regex, whose lastIndex state makes repeated .test() calls
 * unreliable.
 */
export function linkifyParts(text) {
    if (!text) return [];

    return text.split(URL_PATTERN).map((part, i) => (i % 2 === 1 ? { url: part, key: i } : { text: part, key: i }));
}

export function extractLinks(text) {
    if (!text) return [];

    return text.match(URL_PATTERN) ?? [];
}
