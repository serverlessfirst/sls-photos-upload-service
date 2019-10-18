const CONTENT_TYPE_SUFFIX_MAPPINGS: any = {
    'image/jpeg': 'jpg',
    'image/svg+xml': 'svg',
    'image/png': 'png',
};

export function getSupportedContentTypes(): string[] {
    return Object.keys(CONTENT_TYPE_SUFFIX_MAPPINGS);
}

export function isValidImageContentType(contentType: string): boolean {
    return Object.keys(CONTENT_TYPE_SUFFIX_MAPPINGS).includes(contentType);
}

export function getFileSuffixForContentType(contentType: string): string | undefined {
    return CONTENT_TYPE_SUFFIX_MAPPINGS[contentType];
}
