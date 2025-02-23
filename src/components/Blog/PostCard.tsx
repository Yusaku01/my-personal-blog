import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { tv } from 'tailwind-variants';

interface PostCardProps {
  title: string;
  url: string;
  date: Date;
  excerpt?: string;
  platform?: string;
  isExternal?: boolean;
  thumbnail?: string;
  tags?: string[];
}

const postCard = tv({
  slots: {
    article: 'h-full',
    link: 'flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 h-full',
    imageWrapper: 'relative w-full pt-[56.25%] list-view-image',
    image: 'absolute top-0 left-0 w-full h-full object-cover',
    content: 'p-6 flex-grow flex flex-col list-view-content',
    title:
      'text-xl font-semibold mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-3',
    meta: 'mt-auto',
    date: 'text-gray-600 dark:text-gray-400 text-sm mb-3',
    excerpt: 'text-gray-700 dark:text-gray-300 text-sm line-clamp-2',
    tagContainer: 'flex flex-wrap gap-2 mt-3',
    tag: 'px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full',
  },
});

export const PostCard: React.FC<PostCardProps> = ({
  title,
  url,
  date,
  excerpt,
  platform,
  isExternal = false,
  thumbnail = '/images/default-thumbnail.jpg',
  tags = [],
}) => {
  const formattedDate = useMemo(() => {
    try {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime())
        ? format(dateObj, 'yyyy年MM月dd日')
        : format(new Date(), 'yyyy年MM月dd日');
    } catch {
      return format(new Date(), 'yyyy年MM月dd日');
    }
  }, [date]);

  const {
    article,
    link,
    imageWrapper,
    image,
    content,
    title: titleStyle,
    meta,
    date: dateStyle,
    excerpt: excerptStyle,
    tagContainer,
    tag,
  } = postCard();

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
};
