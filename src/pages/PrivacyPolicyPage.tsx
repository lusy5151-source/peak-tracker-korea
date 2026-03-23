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
          <p className="text-xs text-muted-foreground">시행일: 2025년 1월 1일</p>
          <p className="mt-2 text-sm text-foreground leading-relaxed">
            완등(이하 "서비스")은 이용자의 개인정보를 소중히 여기며, 관련 법령에 따라 개인정보를 안전하게 보호하고 있습니다.
          </p>
        </div>

        {/* 1. Data collected */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">1. 수집하는 개인정보</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">필수 수집 항목</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>계정 정보: 이메일 주소, 비밀번호 (암호화 저장)</li>
              <li>프로필 정보: 닉네임, 프로필 사진, 자기소개, 지역</li>
            </ul>
            <p className="font-medium text-foreground mt-3">선택 수집 항목</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>위치 정보: GPS 좌표 (정상 인증 시 사용, 선택 사항)</li>
              <li>사진: 등산 일지 및 정상 인증용 사진</li>
              <li>등산 기록: 등산 일지, 완등 기록, 코스 정보</li>
              <li>소셜 정보: 친구 목록, 산악회 활동 내역</li>
            </ul>
          </div>
        </section>

        {/* 2. How data is used */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">2. 개인정보의 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
            <li>서비스 제공 및 계정 관리</li>
            <li>등산 기록 저장 및 통계 제공</li>
            <li>정상 인증 및 GPS 기반 위치 확인</li>
            <li>등산 일지 공유 및 소셜 기능 제공</li>
            <li>업적 시스템 및 리더보드 운영</li>
            <li>등산 계획 관리 및 알림 발송</li>
            <li>서비스 개선 및 사용자 경험 향상</li>
          </ul>
        </section>

        {/* 3. How data is stored */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">3. 개인정보의 보관 및 보호</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>모든 데이터는 암호화된 클라우드 서버에 안전하게 저장됩니다.</li>
              <li>비밀번호는 단방향 암호화(해싱)되어 저장되며, 원본을 복원할 수 없습니다.</li>
              <li>SSL/TLS 암호화를 통해 데이터 전송 시 보안을 유지합니다.</li>
              <li>접근 권한은 최소한의 범위로 제한됩니다.</li>
              <li>회원 탈퇴 시 개인정보는 관련 법령에 따라 일정 기간 보관 후 파기됩니다.</li>
            </ul>
          </div>
        </section>

        {/* 4. User rights */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">4. 이용자의 권리</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">열람권</strong>: 자신의 개인정보를 확인할 수 있습니다.</li>
              <li><strong className="text-foreground">수정권</strong>: 프로필 정보를 수정할 수 있습니다.</li>
              <li><strong className="text-foreground">삭제권</strong>: 등산 일지, 사진 등 개인 데이터를 삭제할 수 있습니다.</li>
              <li><strong className="text-foreground">동의 철회권</strong>: 위치 정보 등 선택 수집 항목에 대한 동의를 철회할 수 있습니다.</li>
              <li><strong className="text-foreground">회원 탈퇴권</strong>: 언제든지 서비스 이용을 중단하고 계정을 삭제할 수 있습니다.</li>
            </ul>
          </div>
        </section>

        {/* 5. Third party */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">5. 개인정보의 제3자 제공</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            다만, 법령에 의한 요청이 있는 경우에는 관련 법률에 따라 제공될 수 있습니다.
          </p>
        </section>

        {/* 6. Contact */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground">6. 문의처</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
            <p>개인정보 관련 문의사항이 있으시면 아래로 연락해주세요.</p>
            <p className="mt-2">
              📧 이메일:{" "}
              <a href="mailto:privacy@wandeung.app" className="text-primary hover:underline">
                privacy@wandeung.app
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
