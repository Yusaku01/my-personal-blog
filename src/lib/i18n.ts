export const locales = ['ja', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ja';

export const localeMeta: Record<
  Locale,
  {
    htmlLang: string;
    ogLocale: string;
    label: string;
  }
> = {
  ja: {
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
    label: 'JA',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    label: 'EN',
  },
};

export const siteDescription: Record<Locale, string> = {
  ja: 'SAKUSPACE（サクスペース）は、フロントエンド開発〜デザイン領域のことを中心に、アウトプットする場として運営しているブログサイトです。',
  en: 'SAKUSPACE is a personal blog and portfolio sharing notes on frontend development, design, and experiments with modern web technology.',
};

export const uiText = {
  nav: {
    home: 'HOME',
    blog: 'BLOG',
    finds: 'FINDS',
    profile: 'PROFILE',
    contact: 'CONTACT',
  },
  menu: {
    label: {
      ja: 'サイトメニュー',
      en: 'Site menu',
    },
    close: {
      ja: 'メニューを閉じる',
      en: 'Close menu',
    },
    button: 'MENU',
    follow: 'Follow me on',
  },
  blog: {
    readArticle: {
      ja: '記事を読む',
      en: 'Read article',
    },
    viewAll: {
      ja: 'すべての記事を見る',
      en: 'View all posts',
    },
    searchLabel: {
      ja: '記事を検索する',
      en: 'Search articles',
    },
    searchButton: {
      ja: '検索する',
      en: 'Search',
    },
    searchHistory: {
      ja: '検索履歴',
      en: 'Search history',
    },
    searchError: {
      ja: '検索データの読み込みに失敗しました。時間をおいて再度お試しください。',
      en: 'Could not load search data. Please try again later.',
    },
    empty: {
      ja: '検索条件に一致する記事が見つかりませんでした。',
      en: 'No posts matched your search.',
    },
    loadMore: {
      ja: '過去の記事を見る',
      en: 'View older posts',
    },
    rss: {
      ja: 'RSSで購読する',
      en: 'Subscribe via RSS',
    },
    tabs: {
      all: {
        ja: '全て',
        en: 'All',
      },
      personal: {
        ja: '個人',
        en: 'Blog',
      },
      zenn: {
        ja: 'Zenn',
        en: 'Zenn',
      },
      qiita: {
        ja: 'Qiita',
        en: 'Qiita',
      },
    },
    externalPostSuffix: {
      ja: '投稿',
      en: 'post',
    },
    externalLinkLabel: {
      ja: '外部リンク',
      en: 'External link',
    },
    readingTime: {
      ja: (minutes: number) => `読了目安 約${minutes}分`,
      en: (minutes: number) => `${minutes} min read`,
    },
    relatedPosts: {
      ja: '関連記事',
      en: 'Related posts',
    },
  },
  profile: {
    name: {
      ja: 'サック/Sakku',
      en: 'Sakku',
    },
    role: {
      ja: 'デザインエンジニア',
      en: 'Design Engineer',
    },
    intro: {
      ja: 'フロントエンドエンジニアとしての経験とデザインの知識を活かし、Web制作をしています。',
      en: 'I build websites by combining frontend engineering experience with design knowledge.',
    },
    note: {
      ja: '最近はLLMを使って色々検証してます。',
      en: 'Lately I have been exploring practical workflows with LLMs.',
    },
    more: {
      ja: '詳しく見る',
      en: 'View profile',
    },
    imageAlt: {
      ja: 'サックのプロフィールイラスト',
      en: 'Illustrated profile portrait of Sakku',
    },
    photoAlt: {
      ja: 'サックのプロフィール写真',
      en: 'Profile photo of Sakku',
    },
    showPhoto: {
      ja: '写真で見る',
      en: 'View photo',
    },
    showIllustration: {
      ja: 'イラストで見る',
      en: 'View illustration',
    },
    aboutTitle: {
      ja: '自己紹介',
      en: 'About',
    },
    timelineTitle: {
      ja: 'これまで',
      en: 'Journey so far',
    },
    aboutBody: {
      en: [
        'My interest in photography eventually led me into web design. As I designed and implemented websites, I discovered how enjoyable coding could be and grew more interested in frontend development.',
        'These days I often use generative AI tools such as Codex and Claude Code, while keeping a close eye on new web technologies. I am also revisiting computer science fundamentals, development processes, and networking basics through personal study.',
      ],
    },
  },
  finds: {
    description: {
      ja: 'SAKU自身がRSSフィードで購読しているブログや記事をシェアする場所です！',
      en: 'A collection of articles and blogs that I follow via RSS',
    },
    recommendation: {
      ja: '気になった記事があればぜひ読みに行って、SNSなどでシェアされることをおすすめします！',
      en: 'If something catches your eye, please visit the original article to read more and share.',
    },
    copyright: {
      ja: '※ RSSフィードによる本文やOGPの再利用は著作権を考慮し非表示にしております。',
      en: 'Article content and OGP previews are hidden to respect copyright.',
    },
    subscribe: {
      ja: 'あなたもRSS購読する',
      en: 'Subscribe to this RSS feed',
    },
  },
  breadcrumbHome: {
    ja: 'ホーム',
    en: 'Home',
  },
} as const;

export const getLocaleFromPathname = (pathname: string): Locale =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : defaultLocale;

export const stripLocalePrefix = (pathname: string): string => {
  if (pathname === '/en' || pathname === '/en/') {
    return '/';
  }

  if (pathname.startsWith('/en/')) {
    return pathname.slice(3) || '/';
  }

  return pathname || '/';
};

export const localizedPath = (path: string, locale: Locale): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const unprefixedPath = stripLocalePrefix(normalizedPath);

  if (locale === defaultLocale) {
    return unprefixedPath;
  }

  return unprefixedPath === '/' ? '/en/' : `/en${unprefixedPath}`;
};

export const getLanguageSwitchHref = (pathname: string, locale: Locale, search = ''): string =>
  `${localizedPath(pathname, locale)}${search}`;

export const navItemsForLocale = (locale: Locale) => [
  { href: localizedPath('/', locale), text: uiText.nav.home },
  { href: localizedPath('/blog', locale), text: uiText.nav.blog },
  { href: localizedPath('/finds', locale), text: uiText.nav.finds },
  { href: localizedPath('/profile', locale), text: uiText.nav.profile },
  { href: localizedPath('/contact', locale), text: uiText.nav.contact },
];
