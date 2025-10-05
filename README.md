# 建設 AI ERP (Construction AI ERP)

> 존재론적 디자인 시스템을 기반으로 한 중견건설사 경영정보시스템

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📖 목차

- [프로젝트 소개](#프로젝트-소개)
- [핵심 철학](#핵심-철학)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [디자인 시스템](#디자인-시스템)
- [현금흐름 계산 엔진](#현금흐름-계산-엔진)
- [개발 가이드](#개발-가이드)
- [문서](#문서)

## 프로젝트 소개

건설 AI ERP는 중견건설사의 경영 의사결정을 지원하는 차세대 통합 경영정보시스템입니다. 단순한 데이터 집계를 넘어, **존재론적(Ontological) 디자인 철학**을 기반으로 사용자가 데이터의 본질을 직관적으로 이해할 수 있도록 설계되었습니다.

### 왜 이 시스템이 필요한가?

- **복잡한 현금흐름 관리**: 건설업의 특수성(장기 프로젝트, 분할 청구/수금, 유보금, 하도급법 준수 등)을 정확히 반영한 현금흐름 시뮬레이션
- **사업수지 vs 자금수지**: 회계 기준(발생주의)과 현금 흐름(현금주의)을 명확히 분리하여 관리
- **AI 기반 인사이트**: 5개의 전문 AI 에이전트가 재무, 비용, 리스크, 세무, 최적화 분야에서 실시간 조언 제공
- **지식 그래프**: Neo4j 기반 관계형 데이터 분석으로 복잡한 프로젝트 간 연관성 파악

## 핵심 철학

### 1. 존재론적 디자인 시스템 (Ontological Design System)

색상, 간격, 타이포그래피가 단순한 시각적 요소가 아닌 **존재의 계층**을 표현합니다.

#### 색상 체계
```
void (虛無)      → #0A0A0A  절대 배경, 무(無)의 상태
existence (存在)  → #1A1A1A  존재의 시작
essence (本質)    → #2A2A2A  사물의 본질
phenomenon (現象) → #3A3A3A  드러나는 현상
logos (理性)      → #E8E8E8  이성적 사고
pneuma (靈性)     → #C0C0C0  정신적 영역
nous (知性)       → #909090  지적 인식

thesis (正)       → #00D9FF  긍정적 명제
antithesis (反)   → #FF4757  부정적 대립
synthesis (合)    → #00B8D4  종합과 조화
```

#### 피타고라스 간격 시스템 (Pythagorean Spacing)
```
monad (1)   → 4px   단위의 시작
dyad (2)    → 8px   이원성
triad (3)   → 12px  삼위일체
tetrad (4)  → 16px  사원소
pentad (5)  → 24px  오행
hexad (6)   → 32px  조화
heptad (7)  → 48px  완전수
ogdoad (8)  → 64px  팔괘
ennead (9)  → 96px  완성
```

#### 황금비 타이포그래피 (Golden Ratio Typography)
```
φ (phi) = 1.618 기반의 계층적 폰트 크기
- Absolute (絕對)  → 36px  절대적 진리
- Transcendent     → 28px  초월적 개념
- Elevated         → 18px  높은 이해
- Base             → 13px  기본 인식
- Minimal          → 11px  최소 정보
```

### 2. 애니메이션 철학

모든 동작은 의미를 가집니다:
- **breathe (8초)**: 데이터가 살아 숨쉬는 생명력
- **emerge (0.8초)**: 정보가 드러나는 현현(顯現)
- **levitate (4초)**: 중요 요소의 부상(浮上)
- **gleam (6초)**: 통찰의 반짝임

## 주요 기능

### 📊 대시보드
- **실시간 KPI**: NPV, IRR, ROI, 총이익률 등 핵심 재무 지표
- **프로젝트 현황**: 진행률, 일정, 예산 대비 실적 한눈에 파악
- **재무 인사이트**: 전제-추론-결론(∴) 구조의 논리적 분석
- **리스크 모니터**: 색상 코드로 즉시 식별 가능한 위험 요소

### 💰 현금흐름 시뮬레이션
- **S-Curve 진행률**: 3차 다항식 기반 정밀 계산 (3t² - 2t³)
- **사업수지 vs 자금수지**: 발생주의/현금주의 이원 추적
- **유보금 관리**: 5% 기본 유보율, 준공 후 6개월 회수
- **하도급법 준수**: 30일(1개월) 지급 의무 자동 반영
- **시나리오 분석**: 다양한 전제 조건으로 시뮬레이션 실행

### 🤖 AI 에이전트 시스템
5개의 전문 AI 에이전트가 협업:
1. **재무 분석 에이전트**: NPV, IRR, 현금흐름 예측
2. **원가 관리 에이전트**: 원가 절감 기회 발견
3. **리스크 관리 에이전트**: 위험 요소 조기 탐지
4. **세무 최적화 에이전트**: 절세 전략 제안
5. **사업 최적화 에이전트**: 포트폴리오 밸런싱

### 📈 프로젝트 관리
- **프로젝트 유형**: 부동산 개발, 단순 도급, 인프라, 신재생 에너지
- **진행 단계**: 수주 전, 진행 중, 준공, 완료, 취소
- **실시간 진척률**: S-Curve 기반 예측 vs 실적 비교
- **문서 관리**: 계약서, 설계도면, 변경 사항 통합 관리

### 🔍 경영 분석
- **전사 성과**: 부문별, 프로젝트별 수익성 분석
- **Gap Analysis**: 목표 vs 실적 편차 분석 및 원인 파악
- **시뮬레이션**: 다양한 시나리오에서 의사결정 영향 평가

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

### Backend (계획)
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes / tRPC
- **Database**: PostgreSQL 15 (JSONB 활용)
- **Graph DB**: Neo4j (지식 그래프)
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: Bull

### AI & ML (계획)
- **LLM**: OpenAI GPT-4 / Anthropic Claude
- **Vector DB**: Pinecone / Weaviate
- **Embeddings**: OpenAI text-embedding-3
- **Framework**: LangChain

## 시작하기

### 전제 조건
- Node.js 18.17 이상
- npm 9 이상 또는 pnpm 8 이상

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/construction-ai-erp.git
cd construction-ai-erp

# 의존성 설치
npm install
# 또는
pnpm install

# 개발 서버 실행
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/construction_erp"
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="your-password"

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Redis
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 프로젝트 구조

```
construction-ai-erp/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 메인 대시보드
│   ├── projects/            # 프로젝트 관리
│   ├── finance/             # 재무 관리
│   ├── analysis/            # 경영 분석
│   ├── ai/                  # AI 인사이트
│   └── settings/            # 시스템 설정
├── components/              # 재사용 가능한 컴포넌트
│   ├── Metric.tsx          # KPI 메트릭 카드
│   ├── Navigation.tsx      # 메인 네비게이션
│   └── Modal.tsx           # 모달 컴포넌트
├── lib/                     # 핵심 로직 라이브러리
│   ├── cashFlowEngine.ts   # 현금흐름 계산 엔진
│   ├── sampleData.ts       # 샘플 데이터
│   └── utils.ts            # 유틸리티 함수
├── types/                   # TypeScript 타입 정의
│   └── index.ts            # 전역 타입
├── styles/                  # 스타일 파일
│   └── globals.css         # 전역 CSS 및 철학적 변수
├── public/                  # 정적 파일
├── tailwind.config.ts      # Tailwind 설정 (철학적 디자인 시스템)
└── next.config.js          # Next.js 설정
```

## 디자인 시스템

### CSS 클래스 사용 예시

```tsx
// 존재론적 색상 사용
<div className="bg-void text-logos">
  절대 배경에 이성적 텍스트
</div>

// 피타고라스 간격 사용
<div className="p-pentad mb-ogdoad">
  24px 패딩, 64px 하단 여백
</div>

// 본질적(phenomenal) 카드 스타일
<div className="phenomenal">
  자동으로 essence 배경, 테두리, 둥근 모서리 적용
</div>

// 정명제(thesis) 색상 강조
<span className="text-thesis">
  긍정적 지표 강조
</span>

// 애니메이션 적용
<div className="animate-emerge">
  0.8초 동안 드러나는 효과
</div>
```

### 컴포넌트 사용 예시

```tsx
import { Metric } from '@/components/Metric';

<Metric
  label="NPV (순현재가치)"
  value="1,285"
  change={12.5}
  trend="up"
  essence="thesis"
  unit="억"
/>
```

## 현금흐름 계산 엔진

### S-Curve 진행률 계산

건설 프로젝트는 S자 곡선을 따라 진행됩니다:
- **초기 (0-20%)**: 착공 준비, 기초 공사 (느린 진행)
- **중기 (20-80%)**: 본 공사 (빠른 진행)
- **말기 (80-100%)**: 마감, 인허가 (느린 진행)

```typescript
// 3차 다항식 기반 S-Curve
function calculateProgressRates(totalPeriod: number): number[] {
  const rates: number[] = [];
  for (let month = 1; month <= totalPeriod; month++) {
    const t = month / totalPeriod; // 0 ~ 1
    const rate = 3 * t * t - 2 * t * t * t; // 3t² - 2t³
    rates.push(rate);
  }
  return rates;
}
```

### 사업수지 vs 자금수지

#### 사업수지 (Business Balance) - 발생주의
계약법과 회계 기준을 따릅니다:
```typescript
// 월별 매출 = 계약금액 × 월 진행률
const revenue = contractPrice * monthlyRate;
const cost = revenue * costRatio;
const profit = revenue - cost;
```

#### 자금수지 (Cash Flow) - 현금주의
하도급법과 실제 자금 흐름을 따릅니다:
```typescript
// 청구 (3개월마다)
if (month % periodInvoicing === 0) {
  const retention = cumRevenue * retentionRate; // 5% 유보
  invoiceAmount = cumRevenue - cumInvoiced - retention;
}

// 수금 (청구 후 2개월 후)
if (month > periodReceivable) {
  receivedAmount = previousInvoiceAmount;
}

// 하도급 지급 (1개월 후, 법적 의무)
if (month > payMSubcon) {
  subcontractPayment = previousCost * 0.6; // 60%
}

// 자재 지급 (1개월 후)
if (month > payMMaterial) {
  materialPayment = previousCost * 0.4; // 40%
}

// 순현금흐름
const netCashFlow = cashIn - cashOut;
```

### 재무 지표 계산

```typescript
// NPV (순현재가치) - 할인율 10%
let npv = -initialInvestment;
cashFlowData.forEach((data, index) => {
  npv += data.netCashFlow / Math.pow(1 + 0.1, index + 1);
});

// IRR (내부수익률) - Newton-Raphson Method
// NPV = 0이 되는 할인율을 반복적으로 계산

// ROI (투자수익률)
const roi = ((totalCashIn - totalCashOut - initialInvestment) /
             (totalCashOut + initialInvestment)) * 100;

// 회수기간 (Payback Period)
// 누적 현금흐름이 0을 초과하는 첫 번째 월
```

## 개발 가이드

### 코드 스타일

```bash
# ESLint 검사
npm run lint

# 타입 체크
npm run type-check

# 포맷팅 (Prettier 사용 시)
npm run format
```

### 컴포넌트 작성 원칙

1. **함수형 컴포넌트 + Hooks** 사용
2. **TypeScript 인터페이스**로 Props 정의
3. **존재론적 클래스명** 사용 (예: `phenomenal`, `text-logos`)
4. **접근성(a11y)** 고려 - ARIA 라벨, 키보드 네비게이션
5. **애니메이션**은 의미가 있을 때만 사용

```tsx
interface ComponentProps {
  title: string;
  essence?: 'thesis' | 'antithesis' | 'synthesis';
  children: React.ReactNode;
}

export function Component({ title, essence = 'synthesis', children }: ComponentProps) {
  return (
    <div className={`phenomenal animate-emerge text-${essence}`}>
      <h2 className="text-logos text-transcendent">{title}</h2>
      {children}
    </div>
  );
}
```

### 상태 관리 (Zustand)

```typescript
// stores/projectStore.ts
import { create } from 'zustand';

interface ProjectState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

// 컴포넌트에서 사용
import { useProjectStore } from '@/stores/projectStore';

const selectedProject = useProjectStore((state) => state.selectedProject);
const setSelectedProject = useProjectStore((state) => state.setSelectedProject);
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# Docker 컨테이너 빌드
docker build -t construction-ai-erp .

# Docker Compose로 전체 스택 실행
docker-compose up -d
```

## 문서

상세한 문서는 `/home/willey/ai erp/docs/` 폴더를 참조하세요:

- **[시스템 아키텍처](../ai%20erp/docs/architecture/system-overview.md)**: 전체 시스템 구조
- **[기술 스택](../ai%20erp/docs/architecture/tech-stack.md)**: 상세 기술 스택
- **[현금흐름 로직](../ai%20erp/docs/concepts/cash-flow-logic.md)**: 현금흐름 계산 로직 상세 설명
- **[데이터베이스 스키마](../ai%20erp/docs/database/schema.md)**: PostgreSQL 스키마
- **[Neo4j 구조](../ai%20erp/docs/database/neo4j-structure.md)**: 지식 그래프 구조
- **[디자인 철학](../ai%20erp/docs/design/design-philosophy.md)**: 존재론적 디자인 시스템
- **[AI 에이전트](../ai%20erp/docs/AI_AGENTS_ARCHITECTURE.md)**: AI 에이전트 아키텍처
- **[빠른 시작](../ai%20erp/docs/QUICK_START.md)**: 빠른 시작 가이드

## 라이선스

MIT License

Copyright (c) 2025 Construction AI ERP Team

## 기여하기

기여는 언제나 환영합니다! Pull Request를 보내주세요.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 연락처

프로젝트 관리자 - [@your-email](mailto:your-email@example.com)

프로젝트 링크: [https://github.com/your-org/construction-ai-erp](https://github.com/your-org/construction-ai-erp)

---

**建設 AI ERP** - 존재의 본질을 드러내는 경영정보시스템
