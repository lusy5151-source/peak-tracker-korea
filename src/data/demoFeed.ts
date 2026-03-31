/**
 * Comprehensive demo data for first-time experience.
 * Shown when the user is NOT logged in to make the app feel active.
 * Marked with `isDemo: true` so it can be filtered/removed easily.
 */

import hikingImg1 from "@/assets/demo/hiking-1.jpg";
import hikingImg2 from "@/assets/demo/hiking-2.jpg";
import hikingImg3 from "@/assets/demo/hiking-3.jpg";
import hikingImg4 from "@/assets/demo/hiking-4.jpg";
import hikingImg5 from "@/assets/demo/hiking-5.jpg";

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

export interface DemoSummitClaim {
  id: string;
  isDemo: true;
  mountain_id: number;
  summit_name: string;
  nickname: string;
  avatar_url: string | null;
  claimed_at: string;
  user_id: string;
}

export interface DemoActivityItem {
  id: string;
  isDemo: true;
  type: string;
  message: string;
  mountain_id: number | null;
  created_at: string;
  nickname: string;
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
const hoursAgo = (n: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() - n);
  return d.toISOString();
};

export const demoJournals: DemoJournal[] = [
  {
    id: "demo-1",
    isDemo: true,
    mountain_id: 1,
    notes: "백운대 정상에서 본 서울 전경이 정말 장관이었어요! 바람이 좀 불었지만 날씨가 맑아서 멀리까지 보였습니다. 다음에는 인수봉 코스로 도전해볼게요 🏔️",
    photos: [hikingImg1],
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
    mountain_id: 6,
    notes: "설악산 대청봉! 새벽 4시에 출발해서 일출을 봤는데 감동이었어요 ☀️ 힘들었지만 정상에서의 풍경이 모든 걸 보상해줬습니다.",
    photos: [hikingImg2],
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
    mountain_id: 3,
    notes: "노고단에서 바라본 운해가 환상적이었어요 🌅 가을 단풍과 함께 걸으니 정말 힐링되는 시간이었습니다. 추천합니다!",
    photos: [hikingImg3],
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
    mountain_id: 2,
    notes: "첫 등산으로 관악산을 다녀왔어요! 생각보다 힘들었지만 정상에 도착했을 때의 성취감이 대단했습니다. 등산 완전 재밌네요 😆",
    photos: [hikingImg4],
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
    mountain_id: 10,
    notes: "덕유산 향적봉 설경이 정말 아름다웠습니다 ❄️ 곤도라 타고 올라가서 편하게 즐겼어요. 겨울 등산 입문으로 딱이에요!",
    photos: [hikingImg5],
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

export const demoSummitClaims: DemoSummitClaim[] = [
  { id: "demo-sc-1", isDemo: true, mountain_id: 1, summit_name: "백운대", nickname: "산바람", avatar_url: null, claimed_at: hoursAgo(2), user_id: "demo-user-1" },
  { id: "demo-sc-2", isDemo: true, mountain_id: 6, summit_name: "대청봉", nickname: "숲속여행자", avatar_url: null, claimed_at: hoursAgo(5), user_id: "demo-user-2" },
  { id: "demo-sc-3", isDemo: true, mountain_id: 3, summit_name: "천왕봉", nickname: "초보등산러", avatar_url: null, claimed_at: hoursAgo(8), user_id: "demo-user-3" },
  { id: "demo-sc-4", isDemo: true, mountain_id: 2, summit_name: "관악산 정상", nickname: "산바람", avatar_url: null, claimed_at: hoursAgo(12), user_id: "demo-user-1" },
  { id: "demo-sc-5", isDemo: true, mountain_id: 10, summit_name: "향적봉", nickname: "초보등산러", avatar_url: null, claimed_at: hoursAgo(18), user_id: "demo-user-3" },
];

export const demoKingOfDay = {
  user_id: "demo-user-1",
  nickname: "산바람",
  avatar_url: null,
  claim_count: 3,
};

export const demoActivityFeed: DemoActivityItem[] = [
  { id: "demo-act-1", isDemo: true, type: "summit_claim", message: "산바람님이 북한산 백운대를 정복했습니다! 🏔️", mountain_id: 1, created_at: hoursAgo(2), nickname: "산바람" },
  { id: "demo-act-2", isDemo: true, type: "journal", message: "숲속여행자님이 지리산 등산 기록을 공유했습니다 📝", mountain_id: 3, created_at: hoursAgo(4), nickname: "숲속여행자" },
  { id: "demo-act-3", isDemo: true, type: "shared_completion", message: "산바람님 외 2명이 설악산을 함께 완등했습니다! 🎉", mountain_id: 6, created_at: hoursAgo(6), nickname: "산바람" },
  { id: "demo-act-4", isDemo: true, type: "achievement", message: "초보등산러님이 '첫 정상' 업적을 달성했습니다 🏆", mountain_id: null, created_at: hoursAgo(10), nickname: "초보등산러" },
  { id: "demo-act-5", isDemo: true, type: "journal", message: "초보등산러님이 관악산 등산 기록을 공유했습니다 📝", mountain_id: 2, created_at: hoursAgo(14), nickname: "초보등산러" },
];

export const demoLeaderboard = [
  { user_id: "demo-user-1", nickname: "산바람", avatar_url: null, count: 47 },
  { user_id: "demo-user-2", nickname: "숲속여행자", avatar_url: null, count: 32 },
  { user_id: "demo-user-3", nickname: "초보등산러", avatar_url: null, count: 8 },
];

export const demoGroups = [
  { id: "demo-group-1", name: "서울 주말 등산회", description: "매주 주말 서울 근교 산을 함께 오르는 모임", member_count: 24, isDemo: true },
  { id: "demo-group-2", name: "100대 명산 도전단", description: "백대명산 완등을 목표로 하는 도전적인 등산 모임", member_count: 15, isDemo: true },
  { id: "demo-group-3", name: "초보 등산 친구들", description: "등산 처음 시작하는 분들을 위한 편한 모임 🌱", member_count: 38, isDemo: true },
];

export const demoFriends = [
  { nickname: "산바람", bio: "매주 산을 오르는 열정 등산러 🏔️", completedCount: 47 },
  { nickname: "숲속여행자", bio: "자연 속에서 힐링 🌿", completedCount: 32 },
  { nickname: "초보등산러", bio: "올해 등산 시작! 💪", completedCount: 8 },
];

export const demoProgress = {
  completedCount: 23,
  goalCount: 100,
  baekduCompleted: 12,
  baekduTotal: 100,
  earnedBadges: 7,
  totalBadges: 20,
  challengeProgress: 65,
};
