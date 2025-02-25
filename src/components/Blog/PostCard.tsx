import { tv } from 'tailwind-variants';
import type { Post } from '../../types/index';

type PostCardProps = Post;

const article = tv({
  base: 'bg-white dark:bg-[#222] rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700',
});

const link = tv({
  base: 'block',
});

const imageWrapper = tv({
  base: 'relative aspect-video',
});

const image = tv({
  base: 'w-full h-full object-cover',
});

const content = tv({
  base: 'p-4',
});

const titleStyle = tv({
  base: 'text-lg font-medium text-gray-900 dark:text-white mb-2 line-clamp-2',
});

const meta = tv({
  base: 'space-y-2',
});

const dateStyle = tv({
  base: 'text-sm text-gray-600 dark:text-gray-400',
});

const excerptStyle = tv({
  base: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2',
});

const tagContainer = tv({
  base: 'flex flex-wrap gap-2',
});

const tagStyle = tv({
  base: 'text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2',
});

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
    <article className={article()}>
      <a
        href={url}
        className={link()}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : ''}
      >
        {thumbnail && (
          <div className={imageWrapper()}>
            <img src={thumbnail} alt={title} className={image()} />
          </div>
        )}
        <div className={content()}>
          <h2 className={titleStyle()}>{title}</h2>
          <div className={meta()}>
            <time dateTime={publishDate.toISOString()} className={dateStyle()}>
              {new Date(publishDate).toLocaleDateString('ja-JP')}
              {isExternal && platform && ` ${platform} に投稿`}
            </time>
            {excerpt && <p className={excerptStyle()}>{excerpt}</p>}
            {tags.length > 0 && (
              <div className={tagContainer()}>
                {tags.map((tag) => (
                  <span key={tag} className={tagStyle()}>
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
