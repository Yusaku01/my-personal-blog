import type { Post } from '@/types';

type PostCardProps = Post & {
  showTags?: boolean; // タグの表示/非表示を制御するためのプロパティを追加
  index?: number; // 画像の読み込み優先度を決定するためのインデックス
};

// PostCardコンポーネント固有のスタイル
const postCardStyles = {
  article:
    'bg-white dark:bg-gray-900 rounded-md overflow-hidden transition-all duration-200 h-full hover',
  link: 'block',
  imageContainer: 'relative aspect-video overflow-hidden', // overflow-hiddenを維持
  image: 'w-full h-full object-cover transition-all duration-300 ease-in-out', // 拡大を削除
  overlay:
    'absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all duration-300 ease-in-out lg:group-hover:bg-opacity-60', // オーバーレイを追加
  readText:
    'text-white font-bold opacity-0 transform translate-y-4 transition-all duration-300 ease-in-out lg:group-hover:opacity-100 lg:group-hover:translate-y-0 tracking-wider', // 「記事を読む」テキスト
  contentContainer: 'p-4',
  title: 'text-md font-semibold text-gray-900 dark:text-white line-clamp-4 leading-tight',
  date: 'text-sm text-gray-600 dark:text-gray-400',
  excerpt: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2',
  tagContainer: 'flex flex-wrap gap-2',
  tag: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-2.5 font-medium border border-gray-900 dark:border-gray-600 text-gray-700 dark:text-gray-200',
};

export function PostCard({
  title,
  url,
  publishDate,
  thumbnail,
  isExternal,
  tags = [],
  showTags = true, // デフォルトではタグを表示する
  index,
  ...props
}: PostCardProps) {
  const platform = isExternal ? (props as { platform: string }).platform : undefined;

  // 最初の8個の画像はlazy loadingを無効化し、最初の1個は高優先度に設定
  const shouldLazyLoad = index !== undefined && index >= 8;
  const fetchPriority = index === 0 ? 'high' : undefined;

  return (
    <article className={postCardStyles.article}>
      <a
        href={url}
        className={`${postCardStyles.link} group`} // groupクラスを追加
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : ''}
      >
        {thumbnail && (
          <div className={postCardStyles.imageContainer}>
            <img
              src={thumbnail}
              alt={title}
              width={600}
              height={315}
              className={postCardStyles.image}
              loading={shouldLazyLoad ? 'lazy' : undefined}
              fetchPriority={fetchPriority}
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className={postCardStyles.overlay}>
              <span className={postCardStyles.readText}>記事を読む</span>
            </div>
          </div>
        )}
        <div className={postCardStyles.contentContainer}>
          <h2 className={postCardStyles.title}>{title}</h2>
          <div className="space-y-2">
            <time dateTime={publishDate.toISOString()} className={postCardStyles.date}>
              {new Date(publishDate).toLocaleDateString('ja-JP')}
              {isExternal && platform && ` ${platform} 投稿`}
            </time>
            {/* {excerpt && <p className={postCardStyles.excerpt}>{excerpt}</p>} */}
            {showTags && tags.length > 0 && (
              <div className={postCardStyles.tagContainer}>
                {tags.map((tag) => (
                  <span key={tag} className={postCardStyles.tag}>
                    {tag}
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
