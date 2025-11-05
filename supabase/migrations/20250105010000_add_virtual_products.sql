-- ==========================================
-- 가상상품 20개 추가
-- ==========================================
-- 디지털 상품/무형 상품 데이터
-- 재고는 무제한에 가까운 큰 수로 설정
-- 카테고리는 주로 'electronics', 'books' 사용

INSERT INTO public.products (
    name,
    description,
    price,
    category,
    stock_quantity,
    is_active,
    image_url
) VALUES
    -- 온라인 강의/코스 (6개)
    (
        'React 완전정복 온라인 강의',
        'React 19 최신 기능부터 실전 프로젝트까지, 50시간 분량의 완전한 강의 패키지',
        99000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        'Next.js 15 마스터 클래스',
        'App Router, Server Components, Server Actions 완벽 가이드, 인증 프로젝트 포함',
        129000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        'TypeScript 심화 과정',
        '타입 시스템, 제네릭, 고급 패턴까지 배우는 실무 중심 강의',
        89000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        'Supabase 백엔드 개발 코스',
        '인증, 데이터베이스, 스토리지, 실시간 기능 완전 정복',
        119000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '풀스택 웹 개발 부트캠프',
        '프론트엔드부터 백엔드까지, 6개월 과정의 종합 웹 개발 강의',
        299000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        'UI/UX 디자인 실무 강의',
        'Figma 기반 디자인 시스템 구축부터 프로토타이핑까지',
        149000,
        'electronics',
        999999,
        true,
        NULL
    ),

    -- 전자책 (4개)
    (
        '웹 개발자 로드맵 전자책',
        '초보자부터 시니어까지, 단계별 학습 가이드와 실전 프로젝트 예제',
        25000,
        'books',
        999999,
        true,
        NULL
    ),
    (
        '데이터베이스 설계 실무 가이드 eBook',
        'PostgreSQL 기반 최적화된 스키마 설계 방법론, PDF/EPUB 형식',
        32000,
        'books',
        999999,
        true,
        NULL
    ),
    (
        '알고리즘 문제 해결 전략 eBook',
        '코딩 테스트 대비, 500문제 풀이와 해설 포함',
        35000,
        'books',
        999999,
        true,
        NULL
    ),
    (
        '클린 코드 실전 가이드 eBook',
        '리팩토링, 테스트 주도 개발, 아키텍처 패턴 실무 적용법',
        28000,
        'books',
        999999,
        true,
        NULL
    ),

    -- 소프트웨어 라이선스/템플릿 (4개)
    (
        '프리미엄 웹사이트 템플릿 세트',
        'React + Next.js 기반 10가지 완성형 템플릿, 상업적 사용 가능',
        89000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '대시보드 UI 컴포넌트 라이브러리',
        '50개 이상의 재사용 가능한 컴포넌트, shadcn/ui 기반',
        69000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '이커머스 스토어 템플릿 Pro',
        '완전한 쇼핑몰 솔루션, 결제 연동 포함, 소스코드 제공',
        199000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        'WordPress 프리미엄 테마 5종',
        '반응형 디자인, SEO 최적화, 다양한 데모 포함',
        79000,
        'electronics',
        999999,
        true,
        NULL
    ),

    -- 멤버십/구독 (3개)
    (
        '개발자 커뮤니티 프리미엄 멤버십',
        '월간 구독, Q&A 우선 지원, 실시간 멘토링, 프리미엄 자료 접근',
        29000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '온라인 코딩 스쿨 연간 멤버십',
        '모든 강의 무제한 수강, 프로젝트 리뷰, 취업 지원',
        599000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '디자인 리소스 월간 구독',
        '아이콘, 일러스트, 폰트, 템플릿 월 1000개 이상 다운로드',
        19000,
        'electronics',
        999999,
        true,
        NULL
    ),

    -- 디지털 서비스/코드 (3개)
    (
        '웹사이트 구축 서비스 (기본)',
        '5페이지 이내 웹사이트 구축, 반응형 디자인, 1개월 유지보수 포함',
        490000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '코드 리뷰 서비스 (1회)',
        '프로젝트 코드 리뷰, 개선점 제안, 베스트 프랙티스 가이드',
        99000,
        'electronics',
        999999,
        true,
        NULL
    ),
    (
        '기술 면접 코칭 (1시간)',
        '실전 면접 시뮬레이션, 피드백 및 개선 방향 제시, 화상 통화',
        89000,
        'electronics',
        999999,
        true,
        NULL
    )
ON CONFLICT DO NOTHING;

