export interface SearXNGResult {
    url: string;
    title: string;
    content: string;
    engine: string;
    parsed_url?: string[];
    thumbnail?: string;
    img_src?: string[];
}

export interface SearXNGResponse {
    query: string;
    number_of_results: number;
    results: SearXNGResult[];
    answers?: string[];
    corrections?: string[];
    infoboxes?: unknown[];
    suggestions?: string[];
    unresponsive_engines?: string[];
}

export interface SearchState {
    query: string;
    results: SearXNGResult[];
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
}