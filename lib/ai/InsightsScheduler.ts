import cron from 'node-cron';
import { insightsCrawler } from './InsightsCrawler';

/**
 * AI 인사이트 스케줄러
 * 5분마다 자동으로 뉴스를 크롤링하고 온톨로지에 연결
 */
export class InsightsScheduler {
  private task: cron.ScheduledTask | null = null;
  private isRunning = false;
  private lastRun: Date | null = null;
  private runCount = 0;
  private stats = {
    totalInsights: 0,
    totalEntities: 0,
    totalRelations: 0,
  };

  /**
   * 스케줄러 시작 (5분마다 실행)
   */
  start() {
    if (this.task) {
      console.log('[InsightsScheduler] 이미 실행 중입니다.');
      return;
    }

    console.log('[InsightsScheduler] 시작됨 - 5분마다 실행');

    // 5분마다 실행 (cron: */5 * * * *)
    this.task = cron.schedule('*/5 * * * *', async () => {
      await this.runCrawling();
    });

    // 즉시 한 번 실행
    this.runCrawling();
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('[InsightsScheduler] 중지됨');
    }
  }

  /**
   * 크롤링 실행
   */
  private async runCrawling() {
    if (this.isRunning) {
      console.log('[InsightsScheduler] 이전 작업이 아직 실행 중입니다. 건너뜁니다.');
      return;
    }

    this.isRunning = true;
    this.runCount++;

    try {
      console.log(`[InsightsScheduler] 실행 #${this.runCount} 시작`);

      const result = await insightsCrawler.run();

      // 통계 업데이트
      this.stats.totalInsights += result.insightsCount;
      this.stats.totalEntities += result.entitiesCreated;
      this.stats.totalRelations += result.relationsCreated;
      this.lastRun = new Date();

      console.log(`[InsightsScheduler] 실행 #${this.runCount} 완료`);
      console.log(`[InsightsScheduler] 누적 통계:`, this.stats);
    } catch (error) {
      console.error(`[InsightsScheduler] 실행 #${this.runCount} 실패:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 현재 상태 조회
   */
  getStatus() {
    return {
      isActive: !!this.task,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      runCount: this.runCount,
      stats: this.stats,
    };
  }

  /**
   * 수동으로 즉시 실행
   */
  async runNow() {
    console.log('[InsightsScheduler] 수동 실행 요청');
    await this.runCrawling();
  }
}

// 싱글톤 인스턴스
export const insightsScheduler = new InsightsScheduler();
