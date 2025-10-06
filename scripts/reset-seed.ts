#!/usr/bin/env tsx

/**
 * 데이터베이스를 초기화하고 새로운 seed 데이터를 생성하는 스크립트
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  기존 데이터 삭제 중...\n');

  try {
    // 순서대로 삭제 (외래 키 제약 조건 고려)
    await prisma.projectAssumption.deleteMany({});
    console.log('  ✓ ProjectAssumption 삭제 완료');

    await prisma.projectPipeline.deleteMany({});
    console.log('  ✓ ProjectPipeline 삭제 완료');

    await prisma.project.deleteMany({});
    console.log('  ✓ Project 삭제 완료');

    await prisma.company.deleteMany({});
    console.log('  ✓ Company 삭제 완료');

    await prisma.user.deleteMany({});
    console.log('  ✓ User 삭제 완료');

    // ETL 관련 데이터 삭제 (있는 경우)
    try {
      await prisma.eTLJob.deleteMany({});
      console.log('  ✓ ETLJob 삭제 완료');
    } catch (e) {
      // ETL 테이블이 없을 수 있음
    }

    try {
      await prisma.dataset.deleteMany({});
      console.log('  ✓ Dataset 삭제 완료');
    } catch (e) {
      // Dataset 테이블이 없을 수 있음
    }

    console.log('\n✅ 기존 데이터 삭제 완료!\n');

  } catch (error) {
    console.error('❌ 데이터 삭제 실패:', error);
    throw error;
  }
}

async function main() {
  console.log('🔄 데이터베이스 재설정 시작...\n');

  await resetDatabase();

  console.log('✅ 데이터베이스 재설정 완료!');
  console.log('\n다음 명령어를 실행하여 새 데이터를 생성하세요:');
  console.log('npm run db:seed\n');
}

main()
  .catch((e) => {
    console.error('❌ 재설정 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
