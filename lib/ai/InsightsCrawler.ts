import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

interface NewsInsight {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: 'real_estate' | 'finance' | 'construction' | 'regulation' | 'market';
  keywords: string[];
  publishedAt: Date;
  relevantEntities: string[]; // 관련 엔티티 이름
  relevantProjects: string[]; // 관련 프로젝트 이름
}

/**
 * AI 인사이트 크롤러
 * 부동산, 금융, 건설 관련 뉴스를 수집하고 온톨로지에 자동 연결
 */
export class InsightsCrawler {
  private sources = [
    {
      name: '한국경제',
      url: 'https://www.hankyung.com/realestate',
      category: 'real_estate' as const,
    },
    {
      name: '매일경제',
      url: 'https://www.mk.co.kr/news/realestate/',
      category: 'real_estate' as const,
    },
    {
      name: '이데일리 부동산',
      url: 'https://www.edaily.co.kr/sector/real_estate.html',
      category: 'real_estate' as const,
    },
  ];

  /**
   * 모든 소스에서 뉴스 수집
   */
  async crawlAll(): Promise<NewsInsight[]> {
    console.log('[InsightsCrawler] 뉴스 수집 시작...');
    const allInsights: NewsInsight[] = [];

    for (const source of this.sources) {
      try {
        const insights = await this.crawlSource(source.url, source.name, source.category);
        allInsights.push(...insights);
        console.log(`[InsightsCrawler] ${source.name}: ${insights.length}개 수집`);
      } catch (error) {
        console.error(`[InsightsCrawler] ${source.name} 수집 실패:`, error);
      }
    }

    return allInsights;
  }

  /**
   * 특정 소스에서 뉴스 크롤링
   */
  private async crawlSource(
    url: string,
    sourceName: string,
    category: NewsInsight['category']
  ): Promise<NewsInsight[]> {
    try {
      // 실제 크롤링 대신 샘플 데이터 생성 (production에서는 실제 fetch 사용)
      // const response = await fetch(url);
      // const html = await response.text();
      // const $ = cheerio.load(html);

      // 샘플 데이터 (실제로는 크롤링 결과)
      return this.generateSampleInsights(sourceName, category);
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
      return [];
    }
  }

  /**
   * 샘플 인사이트 생성 (개발용)
   */
  private generateSampleInsights(
    source: string,
    category: NewsInsight['category']
  ): NewsInsight[] {
    const samples = [
      {
        title: '서울 강남권 재건축 시장 활기, 프리미엄 10% 상승',
        summary: '서울 강남구 일대 재건축 단지의 프리미엄이 최근 한 달 사이 평균 10% 상승하며 시장이 활기를 띠고 있다.',
        keywords: ['재건축', '강남', '프리미엄', '부동산'],
        relevantEntities: ['강남구', '서울시'],
        relevantProjects: ['강남 재개발'],
      },
      {
        title: '건설사 PF 대출 금리 0.5%p 인하, 유동성 개선 기대',
        summary: '주요 시중은행들이 건설사 프로젝트 파이낸싱(PF) 대출 금리를 일제히 0.5%p 인하하면서 건설업계 유동성 개선이 기대된다.',
        keywords: ['PF', '금리', '건설사', '유동성'],
        relevantEntities: ['은행', '건설사'],
        relevantProjects: [],
      },
      {
        title: '정부, 건설업 규제 완화... 인허가 기간 30% 단축',
        summary: '정부가 건설업 활성화를 위해 각종 규제를 완화하고 인허가 절차를 간소화한다. 평균 인허가 기간이 30% 단축될 전망.',
        keywords: ['규제완화', '인허가', '건설업', '정책'],
        relevantEntities: ['정부', '국토교통부'],
        relevantProjects: [],
      },
      {
        title: '수도권 오피스 공실률 5년 만에 최저... 임대료 상승세',
        summary: '수도권 주요 업무지구의 오피스 공실률이 5년 만에 최저 수준을 기록하며 임대료가 상승세를 보이고 있다.',
        keywords: ['오피스', '공실률', '임대료', '부동산'],
        relevantEntities: ['수도권'],
        relevantProjects: [],
      },
      {
        title: '대형 건설사 해외 수주 증가, 중동·동남아 중심',
        summary: '국내 대형 건설사들의 해외 수주가 증가세를 보이며 중동과 동남아시아 시장을 중심으로 실적 개선이 기대된다.',
        keywords: ['해외수주', '중동', '동남아', '건설'],
        relevantEntities: ['삼성물산', '현대건설', 'GS건설'],
        relevantProjects: [],
      },
    ];

    return samples.map((sample) => ({
      ...sample,
      source,
      url: `https://example.com/news/${Math.random().toString(36).substring(7)}`,
      category,
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    }));
  }

  /**
   * 인사이트를 온톨로지 엔티티와 연결
   */
  async connectToOntology(insights: NewsInsight[]): Promise<void> {
    console.log('[InsightsCrawler] 온톨로지 연결 시작...');

    for (const insight of insights) {
      try {
        // 1. 관련 엔티티 찾기
        const matchedEntities = await prisma.ontologyEntity.findMany({
          where: {
            OR: insight.relevantEntities.map((entityName) => ({
              name: {
                contains: entityName,
                mode: 'insensitive' as const,
              },
            })),
          },
          take: 5,
        });

        // 2. 관련 프로젝트 찾기
        const matchedProjects = await prisma.project.findMany({
          where: {
            OR: insight.relevantProjects.map((projectName) => ({
              projectName: {
                contains: projectName,
                mode: 'insensitive' as const,
              },
            })),
          },
          take: 3,
        });

        // 3. 키워드로 추가 프로젝트 검색
        const keywordProjects = await prisma.project.findMany({
          where: {
            OR: insight.keywords.map((keyword) => ({
              projectName: {
                contains: keyword,
                mode: 'insensitive' as const,
              },
            })),
          },
          take: 2,
        });

        // 4. 인사이트를 CONCEPT 엔티티로 저장
        const insightEntity = await prisma.ontologyEntity.create({
          data: {
            entityType: 'CONCEPT',
            name: insight.title,
            label: `[${insight.category}] ${insight.title.substring(0, 30)}`,
            description: insight.summary,
            properties: {
              source: insight.source,
              url: insight.url,
              category: insight.category,
              keywords: insight.keywords,
              publishedAt: insight.publishedAt.toISOString(),
            },
            source: 'ai_crawler',
            confidence: 0.85,
            verified: false,
          },
        });

        // 5. 관련 엔티티와 관계 생성
        for (const entity of matchedEntities) {
          await prisma.ontologyRelation.create({
            data: {
              fromEntityId: insightEntity.id,
              toEntityId: entity.id,
              relationType: 'RELATED_TO',
              properties: {
                reason: '뉴스 키워드 매칭',
                keywords: insight.keywords,
              },
              confidence: 0.75,
              verified: false,
            },
          });
        }

        // 6. 프로젝트 엔티티 생성 및 연결
        for (const project of [...matchedProjects, ...keywordProjects]) {
          // 프로젝트 엔티티 찾기 또는 생성
          let projectEntity = await prisma.ontologyEntity.findFirst({
            where: {
              entityType: 'PROJECT',
              properties: {
                path: ['projectId'],
                equals: project.id,
              },
            },
          });

          if (!projectEntity) {
            projectEntity = await prisma.ontologyEntity.create({
              data: {
                entityType: 'PROJECT',
                name: project.projectName,
                label: project.projectCode,
                description: `${project.projectType} 프로젝트`,
                properties: {
                  projectId: project.id,
                  client: project.client,
                },
                source: 'project_sync',
                confidence: 1.0,
                verified: true,
              },
            });
          }

          // 인사이트와 프로젝트 연결
          await prisma.ontologyRelation.create({
            data: {
              fromEntityId: insightEntity.id,
              toEntityId: projectEntity.id,
              relationType: 'AFFECTS',
              properties: {
                reason: '시장 동향 영향',
                category: insight.category,
              },
              confidence: 0.7,
              verified: false,
            },
          });
        }

        console.log(
          `[InsightsCrawler] "${insight.title}" 연결 완료: ${matchedEntities.length}개 엔티티, ${matchedProjects.length + keywordProjects.length}개 프로젝트`
        );
      } catch (error) {
        console.error(`Failed to connect insight "${insight.title}":`, error);
      }
    }
  }

  /**
   * 전체 크롤링 및 연결 프로세스 실행
   */
  async run(): Promise<{
    insightsCount: number;
    entitiesCreated: number;
    relationsCreated: number;
  }> {
    const startTime = Date.now();
    console.log('[InsightsCrawler] === 크롤링 시작 ===');

    // 크롤링 전 통계
    const beforeStats = {
      entities: await prisma.ontologyEntity.count(),
      relations: await prisma.ontologyRelation.count(),
    };

    // 1. 뉴스 수집
    const insights = await this.crawlAll();

    // 2. 온톨로지 연결
    await this.connectToOntology(insights);

    // 크롤링 후 통계
    const afterStats = {
      entities: await prisma.ontologyEntity.count(),
      relations: await prisma.ontologyRelation.count(),
    };

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const result = {
      insightsCount: insights.length,
      entitiesCreated: afterStats.entities - beforeStats.entities,
      relationsCreated: afterStats.relations - beforeStats.relations,
    };

    console.log(`[InsightsCrawler] === 완료 (${duration}초) ===`);
    console.log(`[InsightsCrawler] 인사이트: ${result.insightsCount}개`);
    console.log(`[InsightsCrawler] 생성된 엔티티: ${result.entitiesCreated}개`);
    console.log(`[InsightsCrawler] 생성된 관계: ${result.relationsCreated}개`);

    return result;
  }
}

// 싱글톤 인스턴스
export const insightsCrawler = new InsightsCrawler();
