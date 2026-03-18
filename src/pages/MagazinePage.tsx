import { useState, useEffect } from "react";
import { useMagazine, MagazinePost } from "@/hooks/useMagazine";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Bookmark, ArrowLeft, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import MountainMascot from "@/components/MountainMascot";
import MagazineSlideViewer from "@/components/MagazineSlideViewer";

const CATEGORY_COLORS: Record<string, string> = {
  "등산 코스": "bg-primary/10 text-primary",
  "산 소개": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "등산 장비": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "등산 안전": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "맛집 추천": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const MagazinePage = () => {
  const { posts, loading, toggleLike, toggleSave, getLikeCount, isLiked, isSaved } = useMagazine();
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState<MagazinePost | null>(null);
  const [postMeta, setPostMeta] = useState<Record<string, { likes: number; liked: boolean; saved: boolean }>>({});

  useEffect(() => {
    const loadMeta = async () => {
      const meta: Record<string, { likes: number; liked: boolean; saved: boolean }> = {};
      for (const p of posts) {
        const [likes, liked, saved] = await Promise.all([
          getLikeCount(p.id),
          isLiked(p.id),
          isSaved(p.id),
        ]);
        meta[p.id] = { likes, liked, saved };
      }
      setPostMeta(meta);
    };
    if (posts.length > 0) loadMeta();
  }, [posts, user]);

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
    const [likes, liked] = await Promise.all([getLikeCount(postId), isLiked(postId)]);
    setPostMeta((prev) => ({ ...prev, [postId]: { ...prev[postId], likes, liked } }));
  };

  const handleSave = async (postId: string) => {
    await toggleSave(postId);
    const saved = await isSaved(postId);
    setPostMeta((prev) => ({ ...prev, [postId]: { ...prev[postId], saved } }));
  };

  const handleShare = async (post: MagazinePost) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.description || "", url: window.location.href });
      } catch {}
    }
  };

  if (selectedPost) {
    return <MagazineSlideViewer post={selectedPost} onClose={() => setSelectedPost(null)} />;
  }

  return (
    <div className="pb-24 -mx-1">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="rounded-xl p-2 hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">완등 MAGAZINE</h1>
          <p className="text-xs text-muted-foreground">등산 정보 · 코스 · 장비 · 안전 팁</p>
        </div>
      </div>

      {/* Category Filter - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {["전체", "등산 코스", "산 소개", "등산 장비", "등산 안전", "맛집 추천"].map((cat) => (
          <button
            key={cat}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <MountainMascot size={64} />
          <p className="mt-3 text-sm text-muted-foreground">매거진을 불러오는 중...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <MountainMascot size={64} />
          <p className="mt-3 text-sm text-muted-foreground">아직 등록된 매거진이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const meta = postMeta[post.id] || { likes: 0, liked: false, saved: false };
            const catColor = CATEGORY_COLORS[post.category] || "bg-secondary text-secondary-foreground";
            return (
              <article
                key={post.id}
                className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Cover Image */}
                <button
                  onClick={() => setSelectedPost(post)}
                  className="w-full aspect-[16/10] bg-muted relative overflow-hidden group"
                >
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <MountainMascot size={80} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${catColor}`}>
                      {post.category}
                    </span>
                  </div>
                </button>

                {/* Content */}
                <div className="p-4">
                  <button onClick={() => setSelectedPost(post)} className="text-left w-full">
                    <h3 className="text-base font-bold text-foreground leading-snug mb-1">{post.title}</h3>
                    {post.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.description}</p>
                    )}
                  </button>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${meta.liked ? "fill-red-500 text-red-500" : ""}`} />
                        {meta.likes > 0 && <span className="text-[10px]">{meta.likes}</span>}
                      </button>
                      <button
                        onClick={() => handleSave(post.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Bookmark className={`h-4 w-4 ${meta.saved ? "fill-primary text-primary" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleShare(post)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MagazinePage;
