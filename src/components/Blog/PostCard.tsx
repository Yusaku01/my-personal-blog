import type { Post } from '../../types/index';

type PostCardProps = Post;

// PostCardコンポーネント固有のスタイル
const postCardStyles = {
  article:
    'bg-white dark:bg-[#222] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full hover:shadow-md',
  link: 'block',
  imageContainer: 'relative aspect-video',
  image: 'w-full h-full object-cover',
  contentContainer: 'p-4',
  title: 'text-lg font-semibold text-gray-900 dark:text-white line-clamp-4 leading-tight',
  date: 'text-sm text-gray-600 dark:text-gray-400',
  excerpt: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2',
  tagContainer: 'flex flex-wrap gap-2',
  tag: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f2f2f2] dark:bg-[#333] text-[#333] dark:text-gray-200',
};

export function PostCard({
  title,
  url,
  publishDate,
  excerpt,
  thumbnail,
  isExternal,
  tags = [],
  ...props
}: PostCardProps) {
  const platform = isExternal ? (props as { platform: string }).platform : undefined;

  return (
    <article className={postCardStyles.article}>
      <a
        href={url}
        className={postCardStyles.link}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : ''}
      >
        {thumbnail && (
          <div className={postCardStyles.imageContainer}>
            <img src={thumbnail} alt={title} className={postCardStyles.image} />
          </div>
        )}
        <div className={postCardStyles.contentContainer}>
          <h2 className={postCardStyles.title}>{title}</h2>
          <div className="space-y-2">
            <time dateTime={publishDate.toISOString()} className={postCardStyles.date}>
              {new Date(publishDate).toLocaleDateString('ja-JP')}
              {isExternal && platform && ` ${platform} に投稿`}
            </time>
            {excerpt && <p className={postCardStyles.excerpt}>{excerpt}</p>}
            {tags.length > 0 && (
              <div className={postCardStyles.tagContainer}>
                {tags.map((tag) => (
                  <span key={tag} className={postCardStyles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
