import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ImagePlus, X } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ChatMessage {
  id: string;
  club_id: string;
  user_id: string;
  message: string | null;
  image_url: string | null;
  created_at: string;
  profile?: { nickname: string | null; avatar_url: string | null };
}

export default function ClubChat({ clubId }: { clubId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const enrichMessages = useCallback(async (msgs: any[]): Promise<ChatMessage[]> => {
    if (msgs.length === 0) return [];
    const userIds = [...new Set(msgs.map((m) => m.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", userIds);
    const map = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    return msgs.map((m) => ({ ...m, profile: map.get(m.user_id) || null }));
  }, []);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("club_messages" as any)
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: true })
      .limit(100);
    const enriched = await enrichMessages((data as any[]) || []);
    setMessages(enriched);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [clubId, enrichMessages]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`club-chat-${clubId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "club_messages",
        filter: `club_id=eq.${clubId}`,
      }, async (payload) => {
        const newMsg = payload.new as any;
        const enriched = await enrichMessages([newMsg]);
        setMessages((prev) => [...prev, ...enriched]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clubId, enrichMessages]);

  const handleSend = async () => {
    if (!user || (!text.trim() && !imageFile)) return;
    setSending(true);

    let uploadedUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${clubId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("club-logos").upload(path, imageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("club-logos").getPublicUrl(path);
        uploadedUrl = urlData.publicUrl;
      }
    }

    await supabase.from("club_messages" as any).insert({
      club_id: clubId,
      user_id: user.id,
      message: text.trim() || null,
      image_url: uploadedUrl,
    });

    setText("");
    setImageFile(null);
    setImagePreview(null);
    setSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">💬 클럽 채팅</h2>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-10">아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <Avatar className="h-7 w-7 shrink-0">
                  {msg.profile?.avatar_url && <AvatarImage src={msg.profile.avatar_url} />}
                  <AvatarFallback className="text-[10px] bg-muted">{(msg.profile?.nickname || "?").charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] space-y-0.5 ${isMe ? "items-end" : ""}`}>
                {!isMe && <p className="text-[10px] text-muted-foreground">{msg.profile?.nickname || "멤버"}</p>}
                {msg.image_url && (
                  <img src={msg.image_url} alt="" className="rounded-lg max-h-40 object-cover" loading="lazy" />
                )}
                {msg.message && (
                  <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {msg.message}
                  </div>
                )}
                <p className={`text-[9px] text-muted-foreground ${isMe ? "text-right" : ""}`}>
                  {format(new Date(msg.created_at), "HH:mm", { locale: ko })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {imagePreview && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <img src={imagePreview} alt="" className="h-16 rounded-lg object-cover" />
          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} className="hidden" />
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="메시지를 입력하세요..."
          className="rounded-full text-sm h-9"
        />
        <Button size="icon" className="h-8 w-8 rounded-full shrink-0" disabled={sending || (!text.trim() && !imageFile)} onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
