import { useState, useMemo } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '@/types';

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
};

interface BlogControlsProps {
  posts: Post[];
}

export const BlogControls: React.FC<BlogControlsProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPosts, setShowAllPosts] = useState(false);
  const INITIAL_POST_COUNT = 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [posts, searchQuery]);

  const displayPosts = showAllPosts ? filteredPosts : filteredPosts.slice(0, INITIAL_POST_COUNT);
  const hasMorePosts = filteredPosts.length > INITIAL_POST_COUNT;

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className="w-full">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="記事を検索する"
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          検索する
        </button>
      </form>

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
          <p className={styles.emptyResultsText}>検索条件に一致する記事が見つかりませんでした。</p>
        </div>
      ) : (
        <>
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
