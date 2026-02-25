export interface MockWeatherData {
  temp: number;
  feelsLike: number;
  windSpeed: number;
  precipChance: number;
  condition: "맑음" | "구름" | "흐림" | "비" | "눈";
  humidity: number;
}

// Generate deterministic mock weather based on mountain id
export function getMockWeather(mountainId: number): MockWeatherData {
  const seed = mountainId * 7;
  const conditions: MockWeatherData["condition"][] = ["맑음", "구름", "흐림", "비", "눈"];
  return {
    temp: 5 + (seed % 20),
    feelsLike: 2 + (seed % 18),
    windSpeed: 3 + (seed % 15),
    precipChance: (seed * 3) % 80,
    condition: conditions[seed % 5],
    humidity: 40 + (seed % 40),
  };
}

export interface OutfitRecommendation {
  category: string;
  item: string;
  reason: string;
}

export function getOutfitRecommendations(weather: MockWeatherData): OutfitRecommendation[] {
  const recs: OutfitRecommendation[] = [];

  // Base layer
  if (weather.temp < 10) {
    recs.push({ category: "베이스레이어", item: "기능성 보온 내의", reason: "기온이 낮아 보온 내의가 필요합니다" });
  } else {
    recs.push({ category: "베이스레이어", item: "흡습속건 티셔츠", reason: "땀을 빠르게 건조시킵니다" });
  }

  // Jacket
  if (weather.temp < 5) {
    recs.push({ category: "재킷", item: "두꺼운 패딩 재킷", reason: `체감온도 ${weather.feelsLike}°C로 보온이 중요합니다` });
  } else if (weather.temp < 15) {
    recs.push({ category: "재킷", item: "경량 플리스 + 바람막이", reason: "레이어링으로 체온 조절이 용이합니다" });
  } else {
    recs.push({ category: "재킷", item: "가벼운 바람막이", reason: "산 정상은 바람이 강할 수 있습니다" });
  }

  // Rain gear
  if (weather.precipChance > 30) {
    recs.push({ category: "방수", item: "방수 재킷 + 판초", reason: `강수 확률 ${weather.precipChance}%로 방수 장비가 필요합니다` });
  }

  // Pants
  if (weather.temp < 5) {
    recs.push({ category: "바지", item: "기모 등산 바지", reason: "하체 보온이 필요합니다" });
  } else {
    recs.push({ category: "바지", item: "스트레치 등산 바지", reason: "활동성과 통기성이 좋습니다" });
  }

  // Gloves & hat
  if (weather.temp < 8) {
    recs.push({ category: "장갑", item: "등산용 장갑", reason: "손 보온이 필요합니다" });
    recs.push({ category: "액세서리", item: "비니 또는 방한모", reason: "머리 열 손실을 막아줍니다" });
  }

  // Wind
  if (weather.windSpeed > 10) {
    recs.push({ category: "액세서리", item: "넥게이터 / 버프", reason: `풍속 ${weather.windSpeed}km/h로 얼굴 보호가 필요합니다` });
  }

  // Footwear
  if (weather.precipChance > 40 || weather.condition === "눈") {
    recs.push({ category: "신발", item: "방수 등산화 + 게이터", reason: "젖은 지면에서 미끄럼 방지와 방수가 중요합니다" });
  } else {
    recs.push({ category: "신발", item: "경등산화", reason: "발목 지지와 접지력이 좋은 신발을 추천합니다" });
  }

  return recs;
}
