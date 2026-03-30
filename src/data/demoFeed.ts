/**
 * Demo feed data for first-time experience.
 * Shown when the community feed is empty to make the app feel active.
 * Marked with `isDemo: true` so it can be filtered/removed easily.
 */

export interface DemoJournal {
  id: string;
  isDemo: true;
  mountain_id: number;
  notes: string;
  photos: string[];
  weather: string;
  difficulty: string;
  duration: string;
  course_name: string;
  hiked_at: string;
  visibility: "public";
  like_count: number;
  comment_count: number;
  profile: { nickname: string; avatar_url: string | null };
}

export const demoProfiles = [
  { nickname: "산바람", bio: "매주 산을 오르는 열정 등산러 🏔️", avatar: "🏔️" },
  { nickname: "숲속여행자", bio: "자연 속에서 힐링 🌿", avatar: "🌲" },
  { nickname: "초보등산러", bio: "올해 등산 시작! 💪", avatar: "⛰️" },
];

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export const demoJournals: DemoJournal[] = [
  {
    id: "demo-1",
    isDemo: true,
    mountain_id: 1, // 북한산
    notes: "백운대 정상에서 본 서울 전경이 정말 장관이었어요! 바람이 좀 불었지만 날씨가 맑아서 멀리까지 보였습니다. 다음에는 인수봉 코스로 도전해볼게요 🏔️",
    photos: [],
    weather: "☀️ 맑음",
    difficulty: "보통",
    duration: "3시간 20분",
    course_name: "백운대 코스",
    hiked_at: daysAgo(1),
    visibility: "public",
    like_count: 12,
    comment_count: 3,
    profile: { nickname: "산바람", avatar_url: null },
  },
  {
    id: "demo-2",
    isDemo: true,
    mountain_id: 6, // 설악산
    notes: "설악산 대청봉! 새벽 4시에 출발해서 일출을 봤는데 감동이었어요 ☀️ 힘들었지만 정상에서의 풍경이 모든 걸 보상해줬습니다.",
    photos: [],
    weather: "⛅ 구름",
    difficulty: "어려움",
    duration: "7시간 30분",
    course_name: "오색 코스",
    hiked_at: daysAgo(2),
    visibility: "public",
    like_count: 24,
    comment_count: 7,
    profile: { nickname: "산바람", avatar_url: null },
  },
  {
    id: "demo-3",
    isDemo: true,
    mountain_id: 3, // 지리산
    notes: "노고단에서 바라본 운해가 환상적이었어요 🌅 가을 단풍과 함께 걸으니 정말 힐링되는 시간이었습니다. 추천합니다!",
    photos: [],
    weather: "☀️ 맑음",
    difficulty: "보통",
    duration: "2시간 40분",
    course_name: "노고단 코스",
    hiked_at: daysAgo(3),
    visibility: "public",
    like_count: 18,
    comment_count: 5,
    profile: { nickname: "숲속여행자", avatar_url: null },
  },
  {
    id: "demo-4",
    isDemo: true,
    mountain_id: 2, // 관악산
    notes: "첫 등산으로 관악산을 다녀왔어요! 생각보다 힘들었지만 정상에 도착했을 때의 성취감이 대단했습니다. 등산 완전 재밌네요 😆",
    photos: [],
    weather: "⛅ 구름",
    difficulty: "보통",
    duration: "2시간 50분",
    course_name: "관악문 코스",
    hiked_at: daysAgo(4),
    visibility: "public",
    like_count: 8,
    comment_count: 4,
    profile: { nickname: "초보등산러", avatar_url: null },
  },
  {
    id: "demo-5",
    isDemo: true,
    mountain_id: 10, // 덕유산
    notes: "덕유산 향적봉 설경이 정말 아름다웠습니다 ❄️ 곤도라 타고 올라가서 편하게 즐겼어요. 겨울 등산 입문으로 딱이에요!",
    photos: [],
    weather: "❄️ 눈",
    difficulty: "쉬움",
    duration: "1시간 30분",
    course_name: "곤도라 코스",
    hiked_at: daysAgo(5),
    visibility: "public",
    like_count: 15,
    comment_count: 2,
    profile: { nickname: "초보등산러", avatar_url: null },
  },
];
