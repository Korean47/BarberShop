import { useEffect, useMemo, useRef, useState } from 'react';

interface ConnectionHints {
  effectiveType?: string;
  saveData?: boolean;
}

type PerformanceNavigator = Navigator & {
  connection?: ConnectionHints;
  deviceMemory?: number;
};

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function allowsBackgroundVideo() {
  const browser = navigator as PerformanceNavigator;
  const connection = browser.connection;
  if (connection?.saveData || connection?.effectiveType?.includes('2g')) return false;
  if (browser.deviceMemory !== undefined && browser.deviceMemory <= 2) return false;
  return browser.hardwareConcurrency > 2;
}

function localHeroSrcSet(source: string) {
  if (source !== '/images/hero-local.webp') return undefined;
  return '/images/hero-local-800.webp 800w, /images/hero-local-1200.webp 1200w, /images/hero-local.webp 1600w';
}

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
  const images = useMemo(() => parseFallbacks(fallbackUrls, posterUrl || imageUrl), [fallbackUrls, imageUrl, posterUrl]);
  const [active, setActive] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const hasVideo = Boolean(videoUrl || mobileVideoUrl);

  useEffect(() => {
    if (!hasVideo || reducedMotion || !allowsBackgroundVideo()) return;
    const browserWindow = window as IdleWindow;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const enable = () => setVideoEnabled(true);
    const schedule = () => {
      if (browserWindow.requestIdleCallback) idleHandle = browserWindow.requestIdleCallback(enable, { timeout: 1500 });
      else timeoutHandle = window.setTimeout(enable, 900);
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      window.removeEventListener('load', schedule);
      if (idleHandle !== undefined) browserWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [hasVideo, reducedMotion]);

  useEffect(() => {
    if (hasVideo || reducedMotion || images.length < 2) return;
    const interval = window.setInterval(() => setActive((current) => (current + 1) % images.length), 5200);
    return () => window.clearInterval(interval);
  }, [hasVideo, images.length, reducedMotion]);

  useEffect(() => {
    let visible = true;
    const onVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden || !visible) video.pause();
      else void video.play().catch(() => undefined);
    };
    const video = videoRef.current;
    if (!video || !videoEnabled || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      onVisibility();
    }, { threshold: 0.05 });
    observer.observe(video);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion, videoEnabled]);

  const activeImage = images[active];

  return (
    <>
      <img
        key={activeImage}
        src={activeImage}
        srcSet={localHeroSrcSet(activeImage)}
        sizes="100vw"
        alt={alt}
        width="1600"
        height="900"
        fetchPriority="high"
        className="hero-media-fade absolute inset-0 h-full w-full object-cover"
      />
      {hasVideo && videoEnabled && !reducedMotion && (
      <video
        key={`${mobileVideoUrl || ''}|${videoUrl || ''}`}
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
      >
        {mobileVideoUrl && <source src={mobileVideoUrl} media="(max-width: 767px)" />}
        {videoUrl && <source src={videoUrl} />}
      </video>
      )}
    </>
  );
}
