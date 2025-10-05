import { AgentBase } from './AgentBase';
import { AgentType } from '@prisma/client';

export class DataCollectorAgent extends AgentBase {
  constructor() {
    super({
      name: 'DataCollector',
      type: AgentType.DATA_COLLECTOR,
      interval: 86400000, // 24시간마다
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    const collectedData = {
      materialPrices: await this.collectMaterialPrices(),
      weatherData: await this.collectWeatherData(),
      economicIndicators: await this.collectEconomicIndicators(),
    };

    // 수집한 데이터를 패턴 인식 에이전트에게 전달
    await this.sendMessageToAgent(
      'PatternRecognition',
      'NEW_DATA_AVAILABLE',
      collectedData,
      5
    );

    return {
      timestamp: new Date().toISOString(),
      dataCollected: {
        materialPricesCount: collectedData.materialPrices.length,
        weatherLocations: collectedData.weatherData.locations.length,
        economicIndicators: Object.keys(collectedData.economicIndicators).length,
      },
      details: collectedData,
    };
  }

  private async collectMaterialPrices() {
    // 실제로는 외부 API 호출
    return [
      { material: '레미콘', price: 125000, unit: 'm3', change: 2.5 },
      { material: '철근', price: 850000, unit: 'ton', change: -1.2 },
      { material: '시멘트', price: 95000, unit: 'ton', change: 0.8 },
    ];
  }

  private async collectWeatherData() {
    // 실제로는 기상청 API 호출
    return {
      locations: ['서울', '경기', '인천'],
      forecast: {
        today: { temp: 25, rain: 0, condition: '맑음' },
        tomorrow: { temp: 24, rain: 30, condition: '흐림' },
        nextWeek: { avgTemp: 23, rainDays: 2 },
      },
    };
  }

  private async collectEconomicIndicators() {
    return {
      interestRate: 3.5,
      constructionIndex: 105.3,
      materialCostIndex: 108.7,
      laborCostIndex: 102.1,
    };
  }
}
