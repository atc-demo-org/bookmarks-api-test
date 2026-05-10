# bookmarks-api

GitHub Copilot 웨비나 데모용 작은 Bookmark CRUD API.

## 스택
- TypeScript + Express
- Jest + supertest
- in-memory store (production 사용 X)

## 실행
```
npm install
npm run dev      # http://localhost:3000
npm test
```

## 엔드포인트
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST   | `/bookmarks`           | 생성 |
| GET    | `/bookmarks`           | 목록 (newest first); `?tag=<tag>` 쿼리로 태그 필터링 가능 (대소문자 무시) |
| GET    | `/bookmarks/:id`       | 단건 조회 |
| DELETE | `/bookmarks/:id`       | 삭제 |
| GET    | `/health`              | 헬스체크 |

요청 스키마 (POST):
```json
{ "url": "https://...", "title": "...", "tags": ["a", "b"] }
```

## 데모 시나리오

1. **Agent Mode** — `POST /bookmarks` 에 IP 기반 rate limiting 추가 (1분 10회)
2. **Coding Agent** — `GET /bookmarks?tag=...` 검색 엔드포인트 추가 (Issue assign)
3. **AI in Actions** — 모든 PR에 자동 변경 요약 코멘트 (`actions/ai-inference`)

## 컨벤션

- 모든 변경에는 Jest 테스트 추가
- 외부 의존성 추가 시 README에 명시
- DB는 도입하지 않음 (in-memory)
