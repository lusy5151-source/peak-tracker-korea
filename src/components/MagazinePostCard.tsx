import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { MagazinePost, MagazineSlide, useMagazine } from "@/hooks/useMagazine";
import { Heart, Bookmark, Share2 } from "lucide-react";
import MountainMascot from "@/components/MountainMascot";

interface Props {
  post: MagazinePost;
  meta: { likes: number; liked: boolean; saved: boolean };
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (post: MagazinePost) => void;
}

const MagazinePostCard = ({ post, meta, onLike, onSave, onShare }: Props) => {
  const { fetchSlides } = useMagazine();
  const [slides, setSlides] = useState<MagazineSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    fetchSlides(post.id).then((s) => {
      setSlides(s);
      setLoading(false);
    });
  }, [post.id]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const allImages = slides.length > 0
    ? slides.map((s) => s.image_url)
    : post.cover_image_url
      ? [post.cover_image_url]
      : [];

  const totalSlides = allImages.length;

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Category tag */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {post.category}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {new Date(post.created_at).toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Carousel area — 4:5 aspect ratio (1080x1350) */}
      <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <MountainMascot size={48} />
            <p className="mt-2 text-xs text-muted-foreground">불러오는 중...</p>
          </div>
        ) : totalSlides === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <MountainMascot size={80} />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {allImages.map((url, i) => (
                  <div key={i} className="min-w-0 shrink-0 grow-0 basis-full h-full relative">
                    <img
                      src={url}
                      alt={`${post.title} slide ${i + 1}`}
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Title overlay with gradient */}
            <div className="absolute inset-x-0 top-0 pointer-events-none">
              <div className="bg-gradient-to-b from-black/60 via-black/30 to-transparent px-4 pt-4 pb-10">
                <h3 className="text-white font-bold text-lg leading-snug drop-shadow-md">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-white/80 text-xs mt-1 line-clamp-1 drop-shadow-sm">
                    {post.description}
                  </p>
                )}
              </div>
            </div>

            {/* Slide counter badge */}
            {totalSlides > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 rounded-full px-2.5 py-0.5 text-[10px] text-white font-semibold">
                {current + 1}/{totalSlides}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dot indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-1.5 py-2.5">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? "w-2 h-2 bg-[hsl(var(--magazine))]"
                  : "w-1.5 h-1.5 bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className={`h-5 w-5 ${meta.liked ? "fill-red-500 text-red-500" : ""}`} />
            {meta.likes > 0 && <span className="text-xs font-medium">{meta.likes}</span>}
          </button>
          <button
            onClick={() => onShare(post)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => onSave(post.id)}
          className="text-muted-foreground hover:text-[hsl(var(--magazine))] transition-colors"
        >
          <Bookmark className={`h-5 w-5 ${meta.saved ? "fill-[hsl(var(--magazine))] text-[hsl(var(--magazine))]" : ""}`} />
        </button>
      </div>
    </article>
  );
};

export default MagazinePostCard;
