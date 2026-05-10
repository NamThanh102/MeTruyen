import React from 'react';
import { Link } from 'react-router-dom';

const ComicCard = ({ comic }) => {
  const getCoverUrl = (coverImage) => {
    if (!coverImage) return '/assets/default-cover.png';

    if (typeof coverImage === 'string') {
      const trimmed = coverImage.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return parsed?.url || parsed?.secure_url || '/assets/default-cover.png';
        } catch {
          return '/assets/default-cover.png';
        }
      }
      return trimmed || '/assets/default-cover.png';
    }

    if (typeof coverImage === 'object') {
      return coverImage.url || coverImage.secure_url || '/assets/default-cover.png';
    }

    return '/assets/default-cover.png';
  };

  return (
    <Link to={`/comics/${comic.slug}`} className="group block">
      <div
        className="rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="aspect-[3/4] overflow-hidden relative" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <img
            src={getCoverUrl(comic.coverImage)}
            alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/assets/default-cover.png';
            }}
          />
          {(comic.statistics?.totalChapters || 0) > 0 && (
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-xs font-bold bg-black/70 text-white">
              {comic.statistics.totalChapters} Ch
            </span>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold truncate transition-colors" style={{ color: 'var(--text-primary)' }}>
            <span className="group-hover:text-red-500">{comic.title}</span>
          </h3>

          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
              {comic.author || 'Đang cập nhật'}
            </span>
            {(comic.statistics?.totalChapters || 0) > 0 && (
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
              >
                {comic.statistics.totalChapters} Ch
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <span>Views</span>
              {comic.statistics?.totalViews || 0}
            </span>
            <span className="flex items-center gap-1">
              <span>Fav</span>
              {comic.statistics?.totalBookmarks || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ComicCard;
