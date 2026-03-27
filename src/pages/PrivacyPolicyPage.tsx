import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">개인정보처리방침</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Effective date */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">시행일: 2026년 3월 27일</p>
          <p className="mt-2 text-sm text-foreground leading-relaxed">
            완등(이하 "서비스")은 이용자의 개인정보를 소중히 여기며, 관련 법령에 따라 개인정보를 안전하게 보호하고 있습니다.
          </p>
        </div>

        {/* 1. Data collected */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">1. 수집하는 개인정보</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">1-1. 필수 수집 항목</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>계정 정보: 이메일 주소, 비밀번호 (암호화 저장)</li>
              <li>프로필 정보: 닉네임, 프로필 사진, 자기소개, 지역</li>
            </ul>
            <p className="font-medium text-foreground mt-3">1-2. 선택 수집 항목</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>위치 정보: GPS 좌표 (정상 인증 시 사용)</li>
              <li>사진: 등산 일지 및 정상 인증용 사진</li>
              <li>등산 기록: 등산 일지, 완등 기록, 코스 정보</li>
              <li>소셜 정보: 친구 목록, 활동 내역</li>
            </ul>
          </div>
        </section>

        {/* 2. Camera & Photo access */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">2. 카메라 및 사진첩 접근</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">접근 목적</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>정상 인증: 정상 도달 확인을 위한 사진 촬영 또는 업로드</li>
              <li>등산 일지: 기록 보관 및 공유</li>
              <li>프로필 사진 설정</li>
              <li>커뮤니티 및 활동 이미지 공유</li>
            </ul>
            <p className="font-medium text-foreground mt-3">수집 원칙</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>사용자가 직접 요청할 때만 접근</li>
              <li>백그라운드 접근 없음</li>
              <li>선택한 사진만 업로드</li>
              <li>광고 등 다른 목적으로 사용하지 않음</li>
              <li>언제든 삭제 가능</li>
            </ul>
          </div>
        </section>

        {/* 3. Location data */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">3. 위치 정보 수집</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">수집 목적</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>정상 인증 (반경 500m 내 위치 확인)</li>
              <li>지도 내 위치 표시</li>
            </ul>
            <p className="font-medium text-foreground mt-3">수집 방식</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>버튼 클릭 시 1회성 수집</li>
              <li>지속 추적 없음</li>
              <li>백그라운드 수집 없음</li>
            </ul>
            <p className="font-medium text-foreground mt-3">활용 범위</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>인증 기록에만 저장</li>
              <li>지도 기능에서는 저장하지 않음</li>
              <li>마케팅 용도로 사용하지 않음</li>
            </ul>
            <p className="font-medium text-foreground mt-3">동의 및 철회</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>위치 정보는 선택 사항</li>
              <li>언제든 권한 해제 가능</li>
              <li>거부해도 서비스 이용 가능</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              위치정보는 관련 법령에 따라 보호되며, 이용자의 동의 없이 제3자에게 제공되지 않습니다.
            </p>
          </div>
        </section>

        {/* 4. Purpose */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">4. 개인정보 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
            <li>서비스 제공 및 계정 관리</li>
            <li>등산 기록 및 통계 제공</li>
            <li>정상 인증 기능 제공</li>
            <li>소셜 및 커뮤니티 기능 제공</li>
            <li>업적 및 리더보드 운영</li>
            <li>서비스 개선</li>
          </ul>
        </section>

        {/* 5. Data processing delegation */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">5. 개인정보 처리 위탁</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>서비스는 원활한 운영을 위해 외부 서비스를 이용할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>데이터 저장 및 인증: Supabase (또는 Firebase)</li>
              <li>이미지 저장: 클라우드 스토리지</li>
            </ul>
            <p className="mt-2">이 과정에서 일부 개인정보가 해당 서비스에 저장될 수 있습니다.</p>
          </div>
        </section>

        {/* 6. How data is stored */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">6. 개인정보 보관 및 보호</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>모든 데이터는 안전한 서버에 암호화되어 저장됩니다.</li>
              <li>비밀번호는 단방향 암호화(해싱) 처리됩니다.</li>
              <li>SSL/TLS를 통해 데이터 전송을 보호합니다.</li>
              <li>접근 권한은 최소한으로 제한됩니다.</li>
            </ul>
            <p className="font-medium text-foreground mt-3">보관 기간</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 탈퇴 시 개인정보는 즉시 삭제됩니다.</li>
              <li>단, 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관됩니다.</li>
            </ul>
          </div>
        </section>

        {/* 7. User rights */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">7. 이용자의 권리</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">열람권</strong>: 개인정보 확인</li>
              <li><strong className="text-foreground">수정권</strong>: 정보 수정</li>
              <li><strong className="text-foreground">삭제권</strong>: 데이터 삭제</li>
              <li><strong className="text-foreground">동의 철회권</strong>: 선택 정보 수집 중단</li>
              <li><strong className="text-foreground">회원 탈퇴</strong></li>
            </ul>
          </div>
        </section>

        {/* 8. Third party */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">8. 개인정보 제3자 제공</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>
            <p>단, 법령에 따른 요청이 있는 경우 예외적으로 제공될 수 있습니다.</p>
          </div>
        </section>

        {/* 9. Contact */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">9. 문의</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
            <p>개인정보 관련 문의는 아래 이메일로 연락주시기 바랍니다.</p>
            <p className="mt-2">
              📧 이메일:{" "}
              <a href="mailto:lusy5151@gmail.com" className="text-primary hover:underline">
                lusy5151@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
