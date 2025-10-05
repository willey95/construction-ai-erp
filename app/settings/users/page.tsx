'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield, Mail, Phone, Building } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Mock data - 실제로는 API에서 가져와야 함
    const mockUsers = [
      {
        id: '1',
        email: 'admin@company.com',
        fullName: '김관리자',
        department: '경영지원팀',
        role: 'ADMIN',
        phone: '010-1234-5678',
        createdAt: '2024-01-15',
        lastLogin: '2025-10-05 09:30',
        status: 'active',
      },
      {
        id: '2',
        email: 'cfo@company.com',
        fullName: '이재무',
        department: '재무팀',
        role: 'CFO',
        phone: '010-2345-6789',
        createdAt: '2024-02-20',
        lastLogin: '2025-10-05 08:15',
        status: 'active',
      },
      {
        id: '3',
        email: 'pm1@company.com',
        fullName: '박현장',
        department: '공사팀',
        role: 'PM',
        phone: '010-3456-7890',
        createdAt: '2024-03-10',
        lastLogin: '2025-10-04 18:20',
        status: 'active',
      },
      {
        id: '4',
        email: 'pm2@company.com',
        fullName: '최공사',
        department: '공사팀',
        role: 'PM',
        phone: '010-4567-8901',
        createdAt: '2024-04-05',
        lastLogin: '2025-10-03 16:45',
        status: 'inactive',
      },
    ];
    setUsers(mockUsers);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-danger bg-opacity-20 text-danger rounded text-xs">관리자</span>;
      case 'CFO':
        return <span className="px-2 py-1 bg-thesis bg-opacity-20 text-thesis rounded text-xs">재무담당</span>;
      case 'PM':
        return <span className="px-2 py-1 bg-synthesis bg-opacity-20 text-synthesis rounded text-xs">PM</span>;
      default:
        return <span className="px-2 py-1 bg-nous bg-opacity-20 text-nous rounded text-xs">일반</span>;
    }
  };

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-logos">사용자 관리 Users</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-thesis text-void rounded-md hover:bg-opacity-90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            사용자 추가
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">전체 사용자</div>
            <div className="text-2xl text-thesis font-light">{users.length}명</div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">활성 사용자</div>
            <div className="text-2xl text-synthesis font-light">
              {users.filter(u => u.status === 'active').length}명
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">관리자</div>
            <div className="text-2xl text-danger font-light">
              {users.filter(u => u.role === 'ADMIN').length}명
            </div>
          </div>
          <div className="phenomenal p-4">
            <div className="text-xs text-nous mb-1">프로젝트 관리자</div>
            <div className="text-2xl text-logos font-light">
              {users.filter(u => u.role === 'PM').length}명
            </div>
          </div>
        </div>

        {/* 사용자 목록 */}
        <div className="phenomenal p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-essence text-nous text-sm">
                  <th className="text-left py-3 px-2">이름</th>
                  <th className="text-left py-3 px-2">이메일</th>
                  <th className="text-left py-3 px-2">부서</th>
                  <th className="text-left py-3 px-2">역할</th>
                  <th className="text-left py-3 px-2">연락처</th>
                  <th className="text-left py-3 px-2">마지막 로그인</th>
                  <th className="text-left py-3 px-2">상태</th>
                  <th className="text-left py-3 px-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-phenomenon hover:bg-phenomenon transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-thesis bg-opacity-20 flex items-center justify-center">
                          <span className="text-sm text-thesis font-medium">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-logos">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-sm text-pneuma">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-sm text-pneuma">
                        <Building className="w-3 h-3" />
                        {user.department}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-sm text-pneuma">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-pneuma">{user.lastLogin}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.status === 'active'
                          ? 'bg-synthesis bg-opacity-20 text-synthesis'
                          : 'bg-nous bg-opacity-20 text-nous'
                      }`}>
                        {user.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button className="text-thesis hover:text-opacity-70 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-danger hover:text-opacity-70 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 권한 관리 */}
        <div className="phenomenal p-4 mt-6">
          <h2 className="text-lg text-logos mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            역할별 권한 Role Permissions
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-phenomenon rounded">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-danger"></div>
                <h3 className="text-sm text-logos font-medium">관리자 (ADMIN)</h3>
              </div>
              <ul className="text-xs text-pneuma space-y-1">
                <li>✓ 모든 프로젝트 접근</li>
                <li>✓ 사용자 관리</li>
                <li>✓ 시스템 설정</li>
                <li>✓ 재무 데이터 수정</li>
                <li>✓ 데이터 백업/복원</li>
              </ul>
            </div>
            <div className="p-4 bg-phenomenon rounded">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-thesis"></div>
                <h3 className="text-sm text-logos font-medium">재무담당 (CFO)</h3>
              </div>
              <ul className="text-xs text-pneuma space-y-1">
                <li>✓ 모든 재무 데이터 접근</li>
                <li>✓ 재무 분석 리포트</li>
                <li>✓ 예산 승인</li>
                <li>✓ 현금흐름 시뮬레이션</li>
                <li>✗ 사용자 관리</li>
              </ul>
            </div>
            <div className="p-4 bg-phenomenon rounded">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-synthesis"></div>
                <h3 className="text-sm text-logos font-medium">프로젝트 관리자 (PM)</h3>
              </div>
              <ul className="text-xs text-pneuma space-y-1">
                <li>✓ 담당 프로젝트 접근</li>
                <li>✓ 진척률 업데이트</li>
                <li>✓ 비용 입력</li>
                <li>✗ 타 프로젝트 접근</li>
                <li>✗ 시스템 설정</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
