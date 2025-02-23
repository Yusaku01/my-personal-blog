import React, { useState, useMemo } from 'react';
import { PostCard } from './PostCard';
import { input, button } from '../../styles/variants';
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
      .filter(post => {
        const searchLower = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [posts, searchQuery]);

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="search"
            placeholder="記事を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={input()}
          />
        </div>
        <button
          type="submit"
          className={button()}
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
          {filteredPosts.map(post => (
            <PostCard key={post.url} {...post} />
          ))}
        </div>
      )}
    </div>
  );
};