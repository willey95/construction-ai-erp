'use client';

import { useState } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: '안녕하세요! 건설 ERP AI 어시스턴트입니다. 프로젝트 데이터 조회, 재무 분석, 진척률 확인 등을 도와드릴 수 있습니다. 무엇을 도와드릴까요?',
      timestamp: new Date(),
      suggestions: [
        '강동 오피스텔 프로젝트 진척률 알려줘',
        '이번 분기 수익성이 가장 좋은 프로젝트는?',
        '지연 중인 프로젝트 목록 보여줘',
      ]
    }
  ]);
  const [input, setInput] = useState('');

  // 미리 정의된 질문-답변
  const predefinedResponses: { [key: string]: string } = {
    '강동 오피스텔': '강동 오피스텔 A동 프로젝트의 현재 진척률은 95.2%입니다. 계약금액 850억원, 현재까지 총 810억원이 투입되었습니다. 예상 완공일은 2025년 11월 15일이며, 현재 공정대로라면 정상 완공될 것으로 예상됩니다.',
    '수익성': '이번 분기 수익성이 가장 높은 프로젝트는 "용인 아파트 B단지"로 이익률 16.2%를 기록하고 있습니다. 계약금액 152억원 중 현재 80%가 진행되었으며, 예상 이익은 24.6억원입니다.',
    '지연': '현재 지연 중인 프로젝트는 2개입니다:\n\n1. 성남 주상복합 (진척률: 42%, 계획: 55%)\n   - 지연 원인: 자재 수급 지연\n   - 예상 지연일: 15일\n\n2. 광주 학교 (진척률: 38%, 계획: 48%)\n   - 지연 원인: 기상 악화\n   - 예상 지연일: 12일',
    '현금흐름': '이번 달 전체 현금흐름은 +310억원입니다.\n\n수입: 1,850억원 (기성금 수금)\n지출: 1,540억원 (하도급비, 자재비)\n순현금흐름: +310억원\n\n다음 달 예상 현금흐름은 +370억원으로 전망됩니다.',
    '안전': '이번 주 안전 점검 결과:\n\n✅ 우수: 15개 현장\n⚠️ 주의: 3개 현장 (판교 도로, 인천 물류센터, 수원 오피스텔)\n❌ 불량: 0개 현장\n\n주의 현장에는 안전관리자 추가 배치 완료했습니다.',
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      let aiResponse = '죄송합니다. 해당 질문에 대한 정보를 찾을 수 없습니다. 다른 질문을 해주시거나, 다음 중 하나를 선택해주세요:\n\n• 프로젝트 진척률 조회\n• 재무 현황 분석\n• 안전 점검 현황\n• 현금흐름 예측';

      // 키워드 매칭
      for (const [keyword, response] of Object.entries(predefinedResponses)) {
        if (input.includes(keyword)) {
          aiResponse = response;
          break;
        }
      }

      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: [
          '다른 프로젝트도 확인해줘',
          '재무 현황 분석해줘',
          '안전 점검 현황 알려줘',
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-light text-logos mb-6">AI 챗봇 Chatbot</h1>

        {/* 빠른 액션 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setInput('강동 오피스텔 프로젝트 진척률 알려줘')}
            className="phenomenal p-4 hover:border-thesis transition-all text-left group"
          >
            <TrendingUp className="w-6 h-6 text-thesis mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm text-logos">진척률 조회</div>
          </button>
          <button
            onClick={() => setInput('이번 분기 수익성이 가장 좋은 프로젝트는?')}
            className="phenomenal p-4 hover:border-synthesis transition-all text-left group"
          >
            <DollarSign className="w-6 h-6 text-synthesis mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm text-logos">수익성 분석</div>
          </button>
          <button
            onClick={() => setInput('지연 중인 프로젝트 목록 보여줘')}
            className="phenomenal p-4 hover:border-warning transition-all text-left group"
          >
            <Calendar className="w-6 h-6 text-warning mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm text-logos">지연 프로젝트</div>
          </button>
          <button
            onClick={() => setInput('이번 달 현금흐름 알려줘')}
            className="phenomenal p-4 hover:border-amber transition-all text-left group"
          >
            <Sparkles className="w-6 h-6 text-amber mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm text-logos">현금흐름</div>
          </button>
        </div>

        {/* 채팅 영역 */}
        <div className="phenomenal p-6">
          <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-thesis bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-thesis" />
                  </div>
                )}
                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-thesis bg-opacity-20 text-logos'
                      : 'bg-phenomenon text-pneuma'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 text-xs text-pneuma hover:text-thesis bg-phenomenon hover:bg-essence rounded transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-nous mt-1">
                    {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-synthesis bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-synthesis" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 입력 영역 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="프로젝트에 대해 질문해보세요..."
              className="flex-1 px-4 py-3 bg-phenomenon border border-essence rounded-md text-logos focus:outline-none focus:border-thesis"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              전송
            </button>
          </div>
        </div>

        {/* 사용 팁 */}
        <div className="phenomenal p-4 mt-6">
          <h3 className="text-sm text-logos mb-2">💡 사용 팁</h3>
          <ul className="text-xs text-pneuma space-y-1">
            <li>• &quot;프로젝트명 + 진척률/현금흐름/수익성&quot; 형태로 질문하세요</li>
            <li>• &quot;이번 달/분기/년도&quot; 와 같이 기간을 지정할 수 있습니다</li>
            <li>• &quot;지연/위험/우수&quot; 등의 상태로 프로젝트를 필터링할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
