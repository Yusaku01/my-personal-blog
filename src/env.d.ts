declare module 'he' {
  const he: {
    encode(value: string): string;
  };

  export default he;
}

declare module 'open-graph-scraper' {
  type OpenGraphImage = {
    url?: string;
    alt?: string;
  };

  type OpenGraphResult = {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: OpenGraphImage;
  };

  type OpenGraphOptions = {
    url: string;
    timeout?: number;
  };

  type OpenGraphResponse = {
    result: OpenGraphResult;
  };

  export default function ogs(options: OpenGraphOptions): Promise<OpenGraphResponse>;
}
