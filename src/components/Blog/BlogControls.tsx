import React, { useState, useMemo } from 'react';
import { PostCard } from './PostCard';
import { input } from '../../styles/variants';
import type { Post } from '../../types';

interface BlogControlsProps {
  posts: Post[];
}

export const BlogControls: React.FC<BlogControlsProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-10 max-w-xl mx-auto relative">
        <div className="w-full">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検索キーワードを入力してください"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333] dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <button
          type="submit"
          className="absolute top-0 right-0 px-4 py-2 text-sm bg-[#333] text-white hover:opacity-70 transition-all duration-300 rounded-r-md h-full"
        >
          検索する
        </button>
      </form>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            検索条件に一致する記事が見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.url} {...post} />
          ))}
        </div>
      )}
    </div>
  );
};
