import { useState, useMemo, useEffect, useCallback } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '../../types/index';

// BlogControlsコンポーネント固有のスタイル定義
const styles = {
  searchForm: 'mb-8 max-w-xl mx-auto relative',
  searchInput:
    'w-full px-2 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333] bg-white dark:bg-white dark:border-none dark:text-[#222]',
  searchButton:
    'absolute top-0 right-0 px-4 py-2 text-sm bg-[#222] text-white lg:hover:opacity-70 transition-all duration-300 rounded-r-md h-full font-bold leading-loose dark:border-none grid align-center text-[16px]',
  postGrid: 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  loadMoreButton:
    'px-6 py-2 bg-[#333] text-white rounded-md lg:hover:opacity-70 transition-all duration-300 dark:bg-white dark:text-[#333] font-bold leading-loose',
  emptyResults: 'text-center py-12',
  emptyResultsText: 'text-gray-600 dark:text-gray-400 text-lg',
  loadMoreContainer: 'text-center mt-12',
  filtersContainer: 'mb-6 space-y-4',
  filterRow: 'flex flex-wrap gap-4 items-center',
  filterLabel: 'font-medium text-sm text-gray-700 dark:text-gray-300',
  filterSelect: 'px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#333] bg-white dark:bg-white dark:border-none dark:text-[#222]',
  clearFiltersButton: 'px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors',
  searchHistoryContainer: 'mb-4',
  searchHistoryList: 'flex flex-wrap gap-2',
  searchHistoryItem: 'px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
  loadingOverlay: 'absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-md',
  loadingSpinner: 'animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#333] rounded-full',
};

interface BlogControlsProps {
  posts: Post[];
}

// デバウンスフック
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ローカルストレージユーティリティ
const SEARCH_HISTORY_KEY = 'blog-search-history';
const MAX_SEARCH_HISTORY = 5;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const history = getSearchHistory();
    const newHistory = [query, ...history.filter(item => item !== query)]
      .slice(0, MAX_SEARCH_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch {
    // localStorageが使用できない場合は無視
  }
}

export const BlogControls: React.FC<BlogControlsProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const INITIAL_POST_COUNT = 12;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 検索履歴の初期化
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // 検索中ステートの管理
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      setSearchHistory(getSearchHistory());
    }
  };

  const handleSearchHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setSelectedGenre('all');
    setSelectedTag('all');
    setSortBy('date-desc');
  };

  // ジャンルとタグの一覧を取得
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    posts.forEach(post => {
      if (post.platform) {
        genres.add(post.platform);
      }
    });
    return Array.from(genres).sort();
  }, [posts]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      // 検索クエリのフィルタリング
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(searchLower);
        const tagMatch = post.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
        const descriptionMatch = post.excerpt?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !tagMatch && !descriptionMatch) {
          return false;
        }
      }

      // ジャンルフィルタ
      if (selectedGenre !== 'all' && post.platform !== selectedGenre) {
        return false;
      }

      // タグフィルタ
      if (selectedTag !== 'all' && !post.tags?.includes(selectedTag)) {
        return false;
      }

      return true;
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date-desc':
        default:
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
    });

    return filtered;
  }, [posts, debouncedSearchQuery, selectedGenre, selectedTag, sortBy]);

  const displayPosts = showAllPosts ? filteredPosts : filteredPosts.slice(0, INITIAL_POST_COUNT);
  const hasMorePosts = filteredPosts.length > INITIAL_POST_COUNT;

  return (
    <div>
      {/* 検索履歴 */}
      {searchHistory.length > 0 && (
        <div className={styles.searchHistoryContainer}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">最近の検索:</p>
          <div className={styles.searchHistoryList}>
            {searchHistory.map((historyItem, index) => (
              <button
                key={index}
                onClick={() => handleSearchHistoryClick(historyItem)}
                className={styles.searchHistoryItem}
              >
                {historyItem}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 検索フォーム */}
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className="w-full relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトル、タグ、内容で検索..."
            className={styles.searchInput}
          />
          {isSearching && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}></div>
            </div>
          )}
        </div>
        <button type="submit" className={styles.searchButton}>
          検索
        </button>
      </form>

      {/* フィルターコントロール */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <div className="flex items-center gap-2">
            <label className={styles.filterLabel}>ジャンル:</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">すべて</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className={styles.filterLabel}>タグ:</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">すべて</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className={styles.filterLabel}>並び順:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'title')}
              className={styles.filterSelect}
            >
              <option value="date-desc">新しい順</option>
              <option value="date-asc">古い順</option>
              <option value="title">タイトル順</option>
            </select>
          </div>
          
          <button
            onClick={clearFilters}
            className={styles.clearFiltersButton}
          >
            フィルターをクリア
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <a
          href="/rss.xml"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M3.999 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-8zM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V4z" />
            <path d="M5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-3-8.5a1 1 0 0 1 1-1c5.523 0 10 4.477 10 10a1 1 0 1 1-2 0 8 8 0 0 0-8-8 1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1 6 6 0 0 1 6 6 1 1 0 1 1-2 0 4 4 0 0 0-4-4 1 1 0 0 1-1-1z" />
          </svg>
          RSSフィードで購読
        </a>
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyResults}>
          <div className="text-6xl mb-4">🔍</div>
          <p className={styles.emptyResultsText}>
            {debouncedSearchQuery || selectedGenre !== 'all' || selectedTag !== 'all'
              ? '検索条件に一致する記事が見つかりませんでした。'
              : '記事がありません。'
            }
          </p>
          {(debouncedSearchQuery || selectedGenre !== 'all' || selectedTag !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                clearFilters();
              }}
              className="mt-4 px-4 py-2 text-sm text-[#333] hover:text-[#555] transition-colors"
            >
              すべての記事を表示
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredPosts.length}件の記事が見つかりました
          </div>
          <div className={styles.postGrid}>
            {displayPosts.map((post, index) => (
              <PostCard key={post.url} {...post} index={index} />
            ))}
          </div>

          {hasMorePosts && !showAllPosts && (
            <div className={styles.loadMoreContainer}>
              <button onClick={() => setShowAllPosts(true)} className={styles.loadMoreButton}>
                過去の記事を見る
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
