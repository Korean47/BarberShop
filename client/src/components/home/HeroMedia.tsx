import { useEffect, useMemo, useRef, useState } from 'react';

function parseFallbacks(value: string | undefined, primary: string | null | undefined) {
  try {
    const parsed = JSON.parse(value ?? '[]');
    if (Array.isArray(parsed)) {
      const urls = parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
      if (primary && !urls.includes(primary)) urls.unshift(primary);
      if (urls.length) return urls;
    }
  } catch {
    // Invalid admin content falls back to the published hero image.
  }
  return [primary || '/images/hero-local.webp'];
}

export function HeroMedia({
  videoUrl,
  mobileVideoUrl,
  posterUrl,
  imageUrl,
  fallbackUrls,
  reducedMotion,
  alt,
}: {
  videoUrl?: string | null;
  mobileVideoUrl?: string | null;
  posterUrl?: string | null;
  imageUrl?: string | null;
  fallbackUrls?: string;
  reducedMotion: boolean;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const images = useMemo(() => parseFallbacks(fallbackUrls, imageUrl), [fallbackUrls, imageUrl]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (videoUrl || mobileVideoUrl || reducedMotion || images.length < 2) return;
    const interval = window.setInterval(() => setActive((current) => (current + 1) % images.length), 5200);
    return () => window.clearInterval(interval);
  }, [images.length, mobileVideoUrl, reducedMotion, videoUrl]);

  useEffect(() => {
    const onVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) video.pause();
      else if (!reducedMotion) void video.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [reducedMotion]);

  if ((videoUrl || mobileVideoUrl) && !reducedMotion) {
    return (
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        poster={posterUrl || imageUrl || '/images/hero-local.webp'}
        aria-label={alt}
      >
        {mobileVideoUrl && <source src={mobileVideoUrl} media="(max-width: 767px)" />}
        {videoUrl && <source src={videoUrl} />}
      </video>
    );
  }

  return (
    <img
      key={images[active]}
      src={images[active]}
      alt={alt}
      width="1600"
      height="1000"
      fetchPriority="high"
      className="hero-media-fade absolute inset-0 h-full w-full object-cover"
    />
  );
}
