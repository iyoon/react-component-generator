# server/AGENTS.md

## Module Context

Bun 런타임의 AI API 프록시 서버. `/api/config`, `/api/generate` 두 엔드포인트만 제공하며 Vite dev 서버가 `/api`를 3002 포트로 프록시한다.

## Tech Stack and Constraints

- Bun 전용 API(`Bun.serve`, `process.env`)를 쓴다. 외부 HTTP 호출은 내장 `fetch`만 사용하고 SDK나 axios를 추가하지 않는다 (`index.ts:69,101`).
- 모델 ID는 코드에 상수로 고정되어 있다: Anthropic `index.ts:77`, Google `GOOGLE_MODELS` (`index.ts:5`). 모델 변경은 상수만 수정한다.

## Implementation Patterns

- 순수 로직은 별도 파일 + 같은 이름의 `*.test.ts`로 둔다 (`generator.ts`, `fallback.ts`).
- 모든 응답에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`). 새 응답 경로를 추가할 때 헤더를 빠뜨리지 않는다. 프리플라이트(OPTIONS) 처리도 같은 상수를 쓴다.
- 새 프로바이더 추가 시: `Provider` 타입(`src/types/index.ts:1`), `ENV_KEYS`, 호출 함수, `/api/config`의 `envKeys`, 프론트 `App.tsx`를 함께 수정한다.

## Testing Strategy

- 실행: 루트에서 `bun run test`. 서버 테스트도 vitest(jsdom)로 돈다 (`vite.config.ts:14-19`).
- `index.ts`는 import하는 순간 서버가 뜬다. 테스트하려는 로직은 별도 모듈로 분리한다.

## Local Golden Rules

- Asymmetry: Google은 모델 폴백(`index.ts:134-136`)과 `MAX_TOKENS` 절단 감지(`index.ts:123-125`)가 있고 Anthropic 경로(`index.ts:68-96`)에는 둘 다 없다. 한쪽 경로의 오류 처리를 고칠 때 다른 쪽도 필요한지 확인한다.
- Double Defense: 응답 정규화는 `stripCodeFences` -> `ensureRenderCall` 순서로 적용된다 (`index.ts:188`). 프롬프트가 "코드블록만, 마크다운 펜스 금지"를 요구해도 (`index.ts:16`) 후처리를 지우지 않는다. 모델이 어기는 경우를 막는 이중 방어다.
- Hard Constraint: 상태코드 분기가 에러 메시지 문자열에 의존한다. `message.includes('503')`, `'429'` (`index.ts:194,201`)는 `Claude API error: <status>` / `Gemini API error: <status>` 형식(`index.ts:85,112`)이 있어야 동작한다. 에러 메시지 형식을 바꾸면 분기도 함께 수정한다.
- Hard Constraint: `withModelFallback`은 중간 실패를 버리고 마지막 에러만 던진다 (`fallback.ts:11-19`). 폴백 중간 실패의 원인이 필요하면 이 함수 계약부터 바꿔야 한다.
- Security Boundary: 클라이언트 키가 env 키보다 우선한다 (`index.ts:64-66`). 이 우선순위를 뒤집거나, 요청에서 받은 키를 env 값과 합치지 않는다.
