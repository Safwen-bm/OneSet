import { gradientFromSeed, isGradientUrl, cn } from '@/lib/utils';

/**
 * Product art. Seeded gradients stand in until real photography is wired up
 * (see README → Product imagery); a normal URL renders as an image.
 */
export function ProductMedia({
  url,
  alt,
  label,
  className,
  zoom = false,
  children,
}: {
  url?: string | null;
  alt: string;
  label?: string;
  className?: string;
  /** Scales the content (not the frame) on hover — needs a `group` ancestor. */
  zoom?: boolean;
  children?: React.ReactNode;
}) {
  const gradient = isGradientUrl(url);
  const zoomClass = zoom ? 'transition-transform duration-500 ease-set group-hover:scale-110' : undefined;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-tile border border-hairline bg-raised',
        className,
      )}
    >
      {gradient ? (
        <div
          role="img"
          aria-label={alt}
          className={cn('absolute inset-0', zoomClass)}
          style={gradientFromSeed(url ?? alt)}
        >
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_120%,rgba(255,255,255,0.55),transparent_60%)]" />
          {label ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-surface/85 px-2.5 py-1 text-micro text-ink backdrop-blur">
              {label}
            </span>
          ) : null}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url!}
          alt={alt}
          className={cn('absolute inset-0 h-full w-full object-cover', zoomClass)}
          loading="lazy"
        />
      )}
      {children}
    </div>
  );
}
