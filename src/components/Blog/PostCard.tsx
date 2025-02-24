import { tv } from 'tailwind-variants';
import type { Post } from '../../types';

interface PostCardProps extends Post {}

const article = tv({
  base: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow',
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

const tag = tv({
  base: 'text-xs text-gray-600 dark:text-gray-400',
});

export function PostCard({
  title,
  url,
  publishDate,
  excerpt,
  thumbnail,
  platform,
  isExternal,
  tags = [],
}: PostCardProps) {
  const formattedDate = new Date(publishDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className={article()}>
      <a
        href={url}
        className={link()}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <div className={imageWrapper()}>
          <img
            src={thumbnail}
            alt={title}
            className={image()}
            loading="lazy"
            width={320}
            height={180}
          />
        </div>
        <div className={content()}>
          <h3 className={titleStyle()}>{title}</h3>
          <div className={meta()}>
            <p className={dateStyle()}>
              {formattedDate}
              {platform && ` • ${platform}に投稿`}
            </p>
            {excerpt && <p className={excerptStyle()}>{excerpt}</p>}
            {tags.length > 0 && (
              <div className={tagContainer()}>
                {tags.map((tagName) => (
                  <span key={tagName} className={tag()}>
                    #{tagName}
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
