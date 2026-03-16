
-- =============================================
-- PART 1: Add trails for mountains 20-100 (missing trails)
-- =============================================

-- Mountain 20: 두위봉
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(20, '두위봉 정상 코스', 6.2, '보통', 180, '싸리재 주차장', 500, '싸리재에서 출발하는 정상 등반 코스', true, '왕복'),
(20, '운탄고도 연결 코스', 8.5, '보통', 240, '만항재', 450, '만항재에서 운탄고도를 따라가는 능선 코스', false, '종주');

-- Mountain 21: 가리왕산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(21, '장구목이골 코스', 7.8, '어려움', 270, '회동리 주차장', 750, '원시림을 지나 정상까지 오르는 대표 코스', true, '왕복'),
(21, '중봉 능선 코스', 9.5, '어려움', 300, '숙암리', 800, '중봉을 경유하여 정상에 오르는 코스', false, '종주');

-- Mountain 22: 황매산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(22, '철쭉 군락 코스', 3.5, '쉬움', 90, '황매산 오토캠핑장', 300, '봄 철쭉 시즌 가장 인기 있는 코스', true, '순환'),
(22, '모산재 연결 코스', 6.0, '보통', 180, '대기마을', 500, '모산재를 경유하는 능선 종주 코스', false, '종주');

-- Mountain 23: 금오산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(23, '해운사 코스', 4.5, '보통', 150, '해운사 주차장', 450, '해운사에서 출발하여 대혜폭포를 지나는 코스', true, '왕복'),
(23, '남문 코스', 3.8, '보통', 120, '금오산 케이블카 정류장', 350, '케이블카 정류장에서 남문을 거쳐 정상으로', false, '왕복');

-- Mountain 25: 조계산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(25, '송광사 코스', 5.0, '쉬움', 150, '송광사 매표소', 500, '송광사에서 출발하는 대표 등산 코스', true, '왕복'),
(25, '선암사 코스', 4.5, '쉬움', 140, '선암사 주차장', 480, '선암사에서 정상까지 오르는 코스', false, '왕복'),
(25, '송광사-선암사 종주', 8.5, '보통', 270, '송광사 매표소', 600, '두 고찰을 잇는 종주 코스', false, '종주');

-- Mountain 26: 변산반도
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(26, '직소폭포 코스', 3.2, '쉬움', 90, '내소사 주차장', 250, '직소폭포를 경유하는 계곡 코스', true, '순환'),
(26, '세봉 코스', 5.5, '보통', 180, '변산해수욕장', 400, '세봉을 거쳐 관음봉까지', false, '왕복');

-- Mountain 28: 민주지산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(28, '삼도봉 코스', 5.5, '보통', 180, '석기봉 주차장', 550, '삼도봉을 거쳐 민주지산 정상으로', true, '왕복'),
(28, '물한계곡 코스', 7.0, '보통', 210, '물한계곡 입구', 600, '계곡을 따라 오르는 시원한 코스', false, '왕복');

-- Mountain 29: 운문산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(29, '운문사 코스', 5.0, '보통', 180, '운문사 주차장', 550, '운문사에서 출발하는 정상 등반', true, '왕복'),
(29, '아랫재 코스', 4.0, '보통', 150, '아랫재', 450, '아랫재에서 능선을 따라 정상까지', false, '왕복');

-- Mountain 30: 영취산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(30, '진달래 코스', 3.0, '쉬움', 90, '흥국사 주차장', 300, '봄 진달래 군락을 감상하는 인기 코스', true, '순환'),
(30, '흥국사 코스', 4.0, '쉬움', 120, '흥국사', 350, '흥국사에서 정상까지 오르는 코스', false, '왕복');

-- Mountain 31: 비슬산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(31, '참꽃 군락 코스', 4.5, '쉬움', 120, '비슬산 자연휴양림', 400, '참꽃 군락지를 지나는 봄 추천 코스', true, '순환'),
(31, '조화봉 코스', 5.5, '보통', 180, '유가사', 500, '유가사에서 조화봉을 경유하여 정상까지', false, '왕복');

-- Mountain 34: 계족산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(34, '황톳길 맨발 코스', 14.5, '쉬움', 240, '계족산 입구', 200, '전국 최장 황톳길 맨발 산책', true, '순환'),
(34, '정상 코스', 3.0, '쉬움', 60, '장동산림욕장', 200, '장동산림욕장에서 정상까지', false, '왕복');

-- Mountain 35: 남덕유산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(35, '영각사 코스', 6.5, '어려움', 240, '영각사 주차장', 700, '영각사에서 남덕유산 정상까지', true, '왕복'),
(35, '덕유산 종주', 19.0, '어려움', 540, '영각사', 1100, '남덕유산에서 향적봉까지 종주', false, '종주');

-- Mountain 36: 용문산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(36, '용문사 코스', 4.5, '보통', 150, '용문사 주차장', 600, '천년 은행나무가 있는 용문사 경유 코스', true, '왕복'),
(36, '중원산 연결 코스', 7.0, '보통', 210, '사나사', 650, '사나사에서 중원산 연결 능선 종주', false, '종주');

-- Mountain 37: 태화산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(37, '고씨굴 코스', 5.0, '보통', 150, '고씨굴 주차장', 500, '고씨굴 인근에서 출발하는 등산 코스', true, '왕복');

-- Mountain 38: 명성산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(38, '억새 능선 코스', 5.5, '보통', 180, '산정호수 주차장', 550, '산정호수에서 억새 평원을 지나 정상으로', true, '왕복'),
(38, '등룡폭포 코스', 4.5, '보통', 150, '자인사', 500, '등룡폭포를 경유하는 코스', false, '왕복');

-- Mountain 39: 성산일출봉
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(39, '일출봉 탐방로', 1.0, '쉬움', 30, '성산일출봉 매표소', 180, '정상까지 계단으로 올라가는 탐방 코스', true, '왕복');

-- Mountain 40: 조갑산(불갑산)
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(40, '불갑사 코스', 3.5, '쉬움', 100, '불갑사 주차장', 350, '불갑사에서 출발하는 완만한 코스', true, '왕복');

-- Mountain 42: 수락산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(42, '기차바위 코스', 4.0, '보통', 150, '수락산역', 400, '기차바위 능선을 따라 정상까지', true, '왕복'),
(42, '덕릉고개 코스', 3.5, '보통', 120, '덕릉고개', 350, '덕릉고개에서 정상까지 능선 코스', false, '왕복');

-- Mountain 43: 천마산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(43, '호평 코스', 5.0, '보통', 150, '호평동 입구', 500, '호평동에서 정상까지 오르는 코스', true, '왕복'),
(43, '천마산 스키장 코스', 3.5, '보통', 120, '천마산 스키장', 400, '스키장에서 능선을 따라 정상으로', false, '왕복');

-- Mountain 44: 운길산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(44, '수종사 코스', 3.5, '쉬움', 100, '수종사 주차장', 350, '수종사에서 두물머리 조망하며 정상까지', true, '왕복');

-- Mountain 48: 북악산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(48, '성곽길 코스', 4.5, '쉬움', 90, '말바위 안내소', 200, '한양도성 성곽길을 따라 걷는 코스', true, '순환'),
(48, '삼청공원 코스', 3.0, '쉬움', 60, '삼청공원 입구', 180, '삼청공원에서 정상까지', false, '왕복');

-- Mountain 49: 장산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(49, '대천공원 코스', 4.0, '쉬움', 120, '대천공원 입구', 400, '해운대 대천공원에서 정상까지', true, '왕복'),
(49, '반여동 코스', 3.5, '쉬움', 100, '반여동 입구', 350, '반여동에서 출발하는 코스', false, '왕복');

-- Mountain 50: 앞산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(50, '큰골 코스', 4.5, '쉬움', 120, '앞산공원 입구', 400, '큰골을 따라 오르는 대표 코스', true, '왕복'),
(50, '케이블카 코스', 2.0, '쉬움', 40, '앞산 케이블카', 200, '케이블카 이용 후 정상까지', false, '왕복');

-- Mountain 51: 무룡산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(51, '정상 탐방로', 4.0, '보통', 120, '무룡산 입구', 400, '마산만 전경을 조망하는 코스', true, '왕복');

-- Mountain 52: 삼봉산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(52, '세 봉우리 종주', 7.0, '보통', 210, '상동면 주차장', 600, '세 봉우리를 잇는 능선 종주', true, '종주');

-- Mountain 53: 덕항산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(53, '환선굴 코스', 5.5, '보통', 180, '대이리 주차장', 500, '환선굴을 경유하는 코스', true, '왕복'),
(53, '덕항산 정상 코스', 4.5, '보통', 150, '미로면 입구', 450, '정상까지 직등 코스', false, '왕복');

-- Mountain 54: 금원산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(54, '자연휴양림 코스', 5.0, '보통', 180, '금원산 자연휴양림', 600, '자연휴양림에서 정상까지', true, '왕복');

-- Mountain 55: 화악산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(55, '화악산 정상 코스', 7.5, '어려움', 270, '화악터널 입구', 750, '경기도 최고봉 등반 코스', true, '왕복');

-- Mountain 56: 명지산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(56, '익근리 코스', 6.0, '보통', 210, '익근리 주차장', 650, '가평에서 정상까지 대표 코스', true, '왕복'),
(56, '명지폭포 코스', 5.0, '보통', 180, '명지계곡 입구', 550, '명지폭포를 경유하는 계곡 코스', false, '왕복');

-- Mountain 57: 국망봉
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(57, '국망봉 등반로', 5.5, '보통', 180, '국망봉 입구', 550, '조용한 원시림 등반 코스', true, '왕복');

-- Mountain 58: 청태산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(58, '자연휴양림 코스', 4.5, '보통', 150, '청태산 자연휴양림', 500, '잘 정비된 숲길을 따라 정상까지', true, '순환');

-- Mountain 59: 방태산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(59, '주목 군락 코스', 6.5, '보통', 210, '방동약수터', 650, '주목 군락지를 지나는 대표 코스', true, '왕복'),
(59, '개인산 연결 코스', 9.0, '어려움', 300, '진동리', 800, '개인산과 연결되는 능선 종주', false, '종주');

-- Mountain 60: 점봉산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(60, '곰배령 코스', 5.0, '어려움', 180, '곰배령 탐방안내소', 600, '야생화 군락이 유명한 곰배령 코스 (사전예약 필수)', true, '왕복'),
(60, '점봉산 직등 코스', 7.0, '어려움', 270, '귀둔리', 800, '점봉산 정상까지 직등하는 코스', false, '왕복');

-- Mountain 61: 두타산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(61, '무릉계곡 코스', 6.0, '보통', 210, '무릉계곡 매표소', 650, '무릉계곡을 따라 정상까지', true, '왕복'),
(61, '쉰움산 연결 코스', 8.5, '어려움', 300, '무릉계곡', 750, '두타산에서 쉰움산까지 능선 종주', false, '종주');

-- Mountain 62: 황병산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(62, '전나무숲 코스', 5.5, '보통', 180, '황병산 입구', 600, '울창한 전나무 숲을 지나는 코스', true, '왕복');

-- Mountain 63: 백운산(전남)
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(63, '동편제길 코스', 5.5, '보통', 180, '금천마을', 600, '금천마을에서 정상까지', true, '왕복'),
(63, '억불봉 코스', 6.0, '보통', 200, '다압면', 650, '억불봉을 경유하는 코스', false, '왕복');

-- Mountain 64: 적상산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(64, '적상산 둘레길', 5.0, '쉬움', 120, '적상산 주차장', 400, '적상산성을 따라 걷는 둘레길', true, '순환'),
(64, '안국사 코스', 3.5, '쉬움', 90, '안국사', 300, '안국사에서 정상까지', false, '왕복');

-- Mountain 65: 장안산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(65, '뜀뛰기봉 코스', 6.0, '보통', 180, '덕산계곡 입구', 600, '억새 군락이 아름다운 뜀뛰기봉 코스', true, '왕복');

-- Mountain 66: 내연산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(66, '12폭포 코스', 5.5, '보통', 180, '보경사 주차장', 450, '보경사에서 12폭포를 따라 오르는 코스', true, '왕복'),
(66, '향로봉 코스', 7.0, '보통', 210, '보경사', 500, '향로봉을 경유하여 정상까지', false, '종주');

-- Mountain 67: 천태산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(67, '영국사 코스', 3.5, '쉬움', 90, '영국사 주차장', 350, '영국사에서 정상까지 완만한 코스', true, '왕복');

-- Mountain 68: 공작산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(68, '수타사 코스', 5.0, '보통', 150, '수타사 주차장', 500, '수타사에서 정상까지', true, '왕복'),
(68, '생태숲 코스', 6.5, '보통', 180, '수타사 생태숲', 550, '생태숲을 거쳐 정상까지', false, '순환');

-- Mountain 70: 천성산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(70, '내원사 코스', 5.0, '보통', 180, '내원사 주차장', 550, '내원사에서 억새 평원까지', true, '왕복'),
(70, '홍룡사 코스', 4.5, '보통', 150, '홍룡사', 500, '홍룡사에서 정상까지', false, '왕복');

-- Mountain 71: 연화산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(71, '옥천사 코스', 3.0, '쉬움', 90, '옥천사 주차장', 300, '옥천사에서 정상까지 편안한 코스', true, '왕복');

-- Mountain 72: 금수산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(72, '상천리 코스', 4.5, '보통', 150, '상천리 주차장', 500, '상천리에서 정상까지', true, '왕복'),
(72, '능강계곡 코스', 5.5, '보통', 180, '능강계곡 입구', 550, '능강계곡을 따라 정상까지', false, '왕복');

-- Mountain 73: 다갈산(미륵산)
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(73, '통영 케이블카 코스', 2.5, '쉬움', 60, '통영 케이블카', 250, '케이블카 이용 후 정상까지', true, '왕복'),
(73, '미래사 코스', 4.0, '쉬움', 120, '미래사 주차장', 350, '미래사에서 정상까지 걷는 코스', false, '왕복');

-- Mountain 74: 덕숭산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(74, '수덕사 코스', 3.0, '쉬움', 90, '수덕사 주차장', 300, '수덕사에서 정상까지', true, '왕복');

-- Mountain 75: 천황산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(75, '얼음골 코스', 6.0, '보통', 210, '얼음골 주차장', 650, '얼음골에서 능선을 따라 정상까지', true, '왕복'),
(75, '배내골 코스', 7.5, '보통', 240, '배내골 입구', 700, '배내골에서 정상까지', false, '왕복');

-- Mountain 76: 재약산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(76, '표충사 코스', 5.5, '보통', 180, '표충사 주차장', 600, '표충사에서 사자평 억새까지', true, '왕복'),
(76, '석남재 코스', 4.0, '보통', 150, '석남재', 450, '석남재에서 정상까지 능선 코스', false, '왕복');

-- Mountain 77: 신불산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(77, '간월재 코스', 4.5, '보통', 150, '간월재 주차장', 500, '간월재에서 억새 능선을 따라 정상까지', true, '왕복'),
(77, '배내골 코스', 6.0, '보통', 180, '배내골 입구', 600, '배내골에서 정상까지', false, '왕복');

-- Mountain 78: 영축산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(78, '통도사 코스', 5.0, '보통', 180, '통도사 주차장', 550, '통도사에서 정상까지', true, '왕복');

-- Mountain 79: 간월산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(79, '간월재 코스', 3.0, '보통', 90, '간월재', 350, '간월재에서 정상까지 짧은 능선 코스', true, '왕복');

-- Mountain 80: 함백산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(80, '만항재 코스', 2.0, '쉬움', 50, '만항재 주차장', 200, '만항재에서 쉽게 오르는 최단 코스', true, '왕복'),
(80, '싸리재 코스', 5.5, '보통', 180, '싸리재', 500, '싸리재에서 능선을 따라 정상까지', false, '왕복');

-- Mountain 81: 천곡산(청옥산)
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(81, '하늘길 코스', 4.5, '보통', 150, '천곡산 입구', 450, '하늘길을 따라 오르는 코스', true, '왕복');

-- Mountain 82: 모악산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(82, '금산사 코스', 3.5, '쉬움', 100, '금산사 주차장', 400, '금산사에서 정상까지', true, '왕복'),
(82, '수왕사 코스', 4.0, '쉬움', 120, '수왕사 주차장', 420, '수왕사 방면에서 정상까지', false, '왕복');

-- Mountain 83: 선운산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(83, '선운사 코스', 3.0, '쉬움', 80, '선운사 주차장', 250, '선운사에서 동백나무 숲 경유', true, '순환'),
(83, '도솔암 코스', 2.5, '쉬움', 60, '선운사', 200, '선운사에서 도솔암까지', false, '왕복');

-- Mountain 84: 추월산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(84, '보리암 코스', 4.0, '보통', 120, '보리암 입구', 400, '보리암에서 정상까지', true, '왕복');

-- Mountain 85: 두륜산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(85, '대흥사 코스', 5.0, '보통', 150, '대흥사 주차장', 450, '대흥사에서 두륜봉까지', true, '왕복'),
(85, '케이블카 코스', 2.0, '쉬움', 40, '두륜산 케이블카', 200, '케이블카에서 정상까지', false, '왕복');

-- Mountain 86: 천관산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(86, '탑산사 코스', 4.5, '보통', 150, '탑산사 주차장', 450, '기암괴석과 억새를 감상하는 코스', true, '왕복');

-- Mountain 87: 오봉산
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(87, '소양호 조망 코스', 4.0, '보통', 120, '청평사 선착장', 450, '소양호를 조망하며 오르는 코스', true, '왕복');

-- Mountains 88-100 (shorter entries)
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(88, '홍천 코스', 5.0, '보통', 150, '홍천 입구', 500, '홍천에서 정상까지', true, '왕복'),
(89, '대미산 정상로', 4.5, '보통', 150, '태백 입구', 450, '태백에서 정상까지', true, '왕복'),
(90, '백덕산 코스', 6.0, '보통', 210, '영월 입구', 600, '사자산 연계 가능한 코스', true, '왕복'),
(91, '법흥사 코스', 4.5, '보통', 150, '법흥사 주차장', 500, '법흥사에서 정상까지', true, '왕복'),
(92, '마철산 탐방로', 3.5, '보통', 100, '공주 입구', 350, '공주에서 정상까지', true, '왕복'),
(93, '일자봉 코스', 5.5, '보통', 180, '영양 입구', 550, '일자봉을 거쳐 정상까지', true, '왕복'),
(93, '월자봉 코스', 4.5, '보통', 150, '일월산 입구', 500, '월자봉으로 오르는 코스', false, '왕복'),
(94, '화왕산성 코스', 3.5, '보통', 120, '자하골 주차장', 400, '화왕산성과 억새 평원 코스', true, '순환'),
(94, '관룡사 코스', 4.0, '보통', 150, '관룡사 주차장', 450, '관룡사에서 정상까지', false, '왕복'),
(95, '불국사 코스', 3.5, '쉬움', 100, '불국사 주차장', 350, '불국사에서 석굴암까지', true, '왕복'),
(95, '추령 코스', 4.0, '쉬움', 120, '추령 주차장', 300, '추령에서 정상까지', false, '왕복'),
(96, '천문대 코스', 5.0, '보통', 180, '보현산 천문대', 450, '천문대에서 정상까지', true, '왕복'),
(97, '남한산성 코스', 5.5, '쉬움', 120, '남한산성 입구', 200, '남한산성 둘레길 겸 코스', true, '순환'),
(98, '봉곡사 코스', 3.0, '쉬움', 80, '봉곡사 주차장', 200, '봉곡사에서 정상까지', true, '왕복'),
(99, '강천산 코스', 4.0, '쉬움', 100, '강천산 주차장', 350, '강천산과 연계 산행', true, '순환'),
(100, '마니산 정상 코스', 3.5, '쉬움', 90, '마니산 주차장', 300, '계단식 탐방로를 따라 참성단까지', true, '왕복'),
(100, '함허동천 코스', 4.5, '쉬움', 120, '함허동천 입구', 350, '함허동천 계곡을 따라 오르는 코스', false, '왕복');

-- Mountains 101-114 (일반 산)
INSERT INTO trails (mountain_id, name, distance_km, difficulty, duration_minutes, starting_point, elevation_gain_m, description, is_popular, course_type) VALUES
(101, '우면산 둘레길', 3.0, '쉬움', 60, '예술의전당 뒤편', 150, '서초구 도심 속 산책 코스', true, '순환'),
(102, '용마폭포 코스', 3.5, '쉬움', 90, '용마폭포공원', 200, '용마폭포에서 정상까지', true, '왕복'),
(103, '봉산 둘레길', 2.5, '쉬움', 50, '봉산 입구', 120, '북한산 둘레길 연결 코스', true, '순환'),
(104, '안산 자락길', 3.5, '쉬움', 60, '서대문 자연사박물관', 150, '무장애 자락길 산책 코스', true, '순환'),
(105, '백양산 정상로', 4.0, '보통', 120, '성지곡수원지', 350, '성지곡에서 정상까지', true, '왕복'),
(106, '황령산 정상로', 3.0, '쉬움', 80, '황령산 입구', 250, '부산항 야경 조망 코스', true, '왕복'),
(107, '대모산 코스', 3.5, '쉬움', 80, '수서역', 180, '수서역에서 정상까지', true, '왕복'),
(108, '구룡산 코스', 3.0, '쉬움', 70, '개포동 입구', 160, '대모산 연결 가능한 코스', true, '왕복'),
(109, '백운산(경기) 코스', 5.0, '보통', 150, '백운산 주차장', 500, '수려한 계곡과 함께 오르는 코스', true, '왕복'),
(110, '천봉산 코스', 3.0, '쉬움', 80, '옥천 주차장', 250, '벚꽃길을 따라 정상까지', true, '왕복'),
(111, '산방산 탐방로', 1.5, '쉬움', 30, '산방산 주차장', 200, '산방굴사까지 가는 짧은 코스', true, '왕복'),
(112, '새별오름 탐방로', 1.5, '쉬움', 30, '새별오름 주차장', 120, '분화구까지 오르는 짧은 코스', true, '왕복'),
(113, '용눈이오름 탐방로', 1.0, '쉬움', 20, '용눈이오름 주차장', 80, '가족 친화적인 완만한 코스', true, '왕복'),
(114, '검단산 코스', 4.0, '보통', 120, '검단산 주차장', 350, '한강 합류점 조망 코스', true, '왕복');
