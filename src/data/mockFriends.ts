export interface MockFriend {
  id: string;
  name: string;
  avatar: string;
  completedCount: number;
  recentMountainIds: number[];
}

export const mockFriends: MockFriend[] = [
  { id: "f1", name: "김하늘", avatar: "🏔️", completedCount: 34, recentMountainIds: [1, 6, 3, 11] },
  { id: "f2", name: "이숲길", avatar: "🌲", completedCount: 57, recentMountainIds: [2, 10, 24, 8] },
  { id: "f3", name: "박산들", avatar: "⛰️", completedCount: 12, recentMountainIds: [6, 47, 45] },
  { id: "f4", name: "최바람", avatar: "🍃", completedCount: 78, recentMountainIds: [1, 2, 3, 4, 5] },
  { id: "f5", name: "정이슬", avatar: "🌿", completedCount: 23, recentMountainIds: [9, 25, 69] },
];
