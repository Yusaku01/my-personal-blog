import { useState, useMemo } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '../../types/index';

// BlogControlsコンポーネント固有のスタイル定義
const styles = {
  searchForm: 'mb-8 max-w-xl mx-auto relative',
  searchInput:
    'w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333] bg-white dark:bg-white dark:border-none',
  searchButton:
    'absolute top-0 right-0 px-4 py-2 text-sm bg-[#333] text-white hover:opacity-70 transition-all duration-300 rounded-r-md h-full font-bold leading-loose dark:border-none',
  postGrid: 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  loadMoreButton:
    'px-6 py-2 bg-[#333] text-white rounded-md hover:opacity-70 transition-all duration-300 dark:bg-white dark:text-[#333] font-bold leading-loose',
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
  const INITIAL_POST_COUNT = 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
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
            placeholder="検索キーワードを入力してください"
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          検索する
        </button>
      </form>

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyResults}>
          <p className={styles.emptyResultsText}>検索条件に一致する記事が見つかりませんでした。</p>
        </div>
      ) : (
        <>
          <div className={styles.postGrid}>
            {displayPosts.map((post) => (
              <PostCard key={post.url} {...post} />
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
