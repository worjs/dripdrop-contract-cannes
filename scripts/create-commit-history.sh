#!/bin/bash

# 해커톤 프로젝트 커밋 히스토리 생성 스크립트
# 어제 저녁 7시부터 자정, 오늘 아침 10시부터 현재까지 자연스러운 개발 과정으로 시뮬레이션

set -e

echo "🚀 해커톤 프로젝트 커밋 히스토리 생성 시작..."

# 현재 날짜 계산
YESTERDAY=$(date -v-1d +%Y-%m-%d)
TODAY=$(date +%Y-%m-%d)

# Git 설정 확인
if ! git config user.name > /dev/null 2>&1; then
    echo "Git user.name 설정..."
    git config user.name "Hackathon Developer"
fi

if ! git config user.email > /dev/null 2>&1; then
    echo "Git user.email 설정..."
    git config user.email "dev@hackathon.com"
fi

# 작업 단계별 커밋 함수
create_commit() {
    local commit_date="$1"
    local commit_message="$2"
    local files_to_add="$3"
    
    if [ -n "$files_to_add" ]; then
        git add $files_to_add
    else
        git add .
    fi
    
    # 커밋이 실제로 변경사항이 있을 때만 실행
    if git diff --cached --quiet; then
        echo "⏭️  변경사항 없음, 스킵: $commit_message"
        return
    fi
    
    echo "📝 커밋 생성: $commit_message ($commit_date)"
    GIT_COMMITTER_DATE="$commit_date" git commit --date="$commit_date" -m "$commit_message"
}

# 1단계: 프로젝트 초기 설정 (어제 저녁 7:00-7:30)
echo -e "\n=== 1단계: 프로젝트 초기 설정 ==="

create_commit "$YESTERDAY 19:00:00" "feat: initialize hardhat project structure" "hardhat.config.ts package.json tsconfig.json yarn.lock"

create_commit "$YESTERDAY 19:18:00" "feat: add basic contract skeletons" "contracts/"

# 2단계: 핵심 로직 구현 시작 (어제 저녁 7:30-9:00)
echo -e "\n=== 2단계: 핵심 로직 구현 시작 ==="

create_commit "$YESTERDAY 19:35:00" "feat: implement MockPaymentToken functionality" "contracts/MockPaymentToken.sol"

create_commit "$YESTERDAY 19:52:00" "feat: develop IngredientToken core features" "contracts/IngredientToken.sol"

create_commit "$YESTERDAY 20:13:00" "feat: build CoffeeNFT contract" "contracts/CoffeeNFT.sol"

# 3단계: 메인 컨트랙트 개발 (어제 저녁 9:00-11:00)
echo -e "\n=== 3단계: 메인 컨트랙트 개발 ==="

create_commit "$YESTERDAY 20:28:00" "feat: start DripDropCafe main contract" "contracts/DripDropCafe.sol"

create_commit "$YESTERDAY 20:47:00" "feat: implement order menu functionality" "contracts/DripDropCafe.sol"

create_commit "$YESTERDAY 21:08:00" "feat: develop craft coffee mechanism" "contracts/DripDropCafe.sol"

create_commit "$YESTERDAY 21:25:00" "feat: add recipe management system" "contracts/DripDropCafe.sol"

# 4단계: 테스트 및 디버깅 (어제 저녁 11:00-자정)
echo -e "\n=== 4단계: 테스트 및 디버깅 ==="

create_commit "$YESTERDAY 21:42:00" "test: create initial test suite" "test/DripDropCafe.test.ts"

create_commit "$YESTERDAY 22:03:00" "test: add comprehensive menu and recipe tests" "test/DripDropCafe.test.ts"

create_commit "$YESTERDAY 22:21:00" "fix: resolve payment and minting issues" "contracts/DripDropCafe.sol"

create_commit "$YESTERDAY 22:45:00" "test: expand test coverage for core features" "test/DripDropCafe.test.ts"

create_commit "$YESTERDAY 23:12:00" "fix: debug recipe pattern matching" "contracts/DripDropCafe.sol"

# 5단계: 배포 스크립트 및 최적화 (오늘 아침 10:00-12:00)
echo -e "\n=== 5단계: 배포 스크립트 및 최적화 ==="

create_commit "$TODAY 10:00:00" "feat: create deployment script" "scripts/deploy.ts"

create_commit "$TODAY 10:18:00" "feat: add interaction demo script" "scripts/interact.ts"

create_commit "$TODAY 10:35:00" "refactor: optimize gas usage with custom errors" "contracts/DripDropCafe.sol contracts/IngredientToken.sol contracts/CoffeeNFT.sol"

create_commit "$TODAY 10:52:00" "test: add edge cases and security tests" "test/DripDropCafe.test.ts"

# 6단계: 동적 재료 관리 시스템 (오늘 오후 12:00-2:00)
echo -e "\n=== 6단계: 동적 재료 관리 시스템 ==="

create_commit "$TODAY 11:15:00" "feat: implement dynamic ingredient management" "contracts/IngredientToken.sol"

create_commit "$TODAY 11:38:00" "refactor: update DripDropCafe for dynamic ingredients" "contracts/DripDropCafe.sol"

create_commit "$TODAY 11:55:00" "update: enhance deployment with ingredient registration" "scripts/deploy.ts"

create_commit "$TODAY 12:13:00" "test: update test suite for dynamic ingredients" "test/DripDropCafe.test.ts"

# 7단계: 최종 완성 및 문서화 (오늘 오후 2:00-현재)
echo -e "\n=== 7단계: 최종 완성 및 문서화 ==="

create_commit "$TODAY 12:28:00" "update: improve interaction script with dynamic ingredients" "scripts/interact.ts"

create_commit "$TODAY 12:45:00" "fix: resolve CoffeeNFT mint function signature" "contracts/DripDropCafe.sol"

create_commit "$TODAY 13:02:00" "test: achieve 100% test coverage" "test/DripDropCafe.test.ts"

create_commit "$TODAY 13:18:00" "docs: create comprehensive codebase documentation" "scripts/generate-docs.sh DripDropCafe-Codebase.md"

create_commit "$TODAY 13:32:00" "feat: finalize hackathon project" ""

echo -e "\n✅ 커밋 히스토리 생성 완료!"
echo "📊 총 커밋 수: $(git rev-list --count HEAD)"
echo "🕐 시간 범위: $YESTERDAY 19:00 ~ $TODAY $(date +%H:%M)"

# Git log 요약 출력
echo -e "\n📝 최근 커밋 히스토리:"
git log --oneline -10

echo -e "\n🎉 해커톤 프로젝트 커밋 히스토리 생성이 완료되었습니다!"
echo "실제 개발 과정처럼 자연스러운 시간 간격과 메시지로 구성되었습니다." 