# AGENTS.md

## Operational Commands

패키지 매니저는 bun 고정 (`bun.lock`). npm/yarn/pnpm 사용 금지.

- 개발 서버 (API 3002 + Vite 5173 동시): `bun run dev`
- API 서버만: `bun run server`
- 테스트 전체: `bun run test` (`vitest run`)
- 테스트 감시: `bun run test:watch`
- 린트: `bun run lint`
- 빌드 + 타입체크: `bun run build` (`tsc -b && vite build`)

완료 보고 전에 `bun run test`, `bun run lint`, `bun run build`를 모두 실행한다.

## Golden Rules

### Immutable

- API 키 값(`.env`, 요청 바디의 `apiKey`)을 로그, 응답, 커밋, 클라이언트 번들에 노출하지 않는다. 서버는 키 보유 여부만 boolean으로 내려준다 (`server/index.ts:147-157`). 이 형태를 유지한다.
- `.env`는 gitignore 대상이며 워크트리에는 `.worktreeinclude`로 복사된다. 커밋하지 않는다.
- Gemini 호출 URL은 키를 쿼리스트링에 포함한다 (`server/index.ts:99`). 이 URL을 로그나 에러 메시지에 출력하지 않는다.

### Hard Constraints

- 생성 코드는 react-live `noInline` 모드로 실행된다 (`src/components/LivePreview.tsx:14`). 코드 끝에 `render(<Component />)` 호출이 없으면 미리보기가 비어 있다. 서버가 `ensureRenderCall`로 보정한다 (`server/generator.ts:16-23`). 이 후처리를 제거하지 않는다.
- 생성 코드는 import 없이 전역 `React`만 쓰는 순수 JavaScript여야 한다 (`server/index.ts:11,20`). `SYSTEM_PROMPT`를 수정할 때 이 제약을 지운다면 react-live `scope` 설정도 함께 바꿔야 한다.
- API 포트 3002가 두 곳에 하드코딩되어 있다 (`server/index.ts:139`, `vite.config.ts:11`). 한쪽만 바꾸면 프록시가 깨지므로 항상 같이 수정한다.
- 테스트는 `bun test`가 아니라 `bun run test`로 실행한다. 테스트 환경(jsdom, setup 파일, include 경로)은 `vite.config.ts:14-19`의 vitest 설정에 의존한다.

### Do's and Don'ts

- Do: 테스트가 필요한 서버 로직은 부수효과 없는 별도 모듈로 분리한다 (`server/generator.ts:1-2`, `server/fallback.ts`). `server/index.ts`는 import 즉시 `Bun.serve`를 실행하므로 테스트에서 import할 수 없다.
- Do: 새 순수 함수에는 같은 디렉토리에 `*.test.ts`를 함께 추가한다.
- Don't: 모델 응답 처리 로직을 `index.ts`에 직접 추가하지 않는다.

### Test Boundary

- 테스트 있음: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`, `src/hooks/useComponentGenerator.ts`, `src/hooks/usePersistentState.ts`, `src/App.tsx`, `src/utils/`.
- 테스트 없음: `server/index.ts`, `LivePreview.tsx`, `ComponentCard.tsx`. 이 영역을 수정할 때는 변경 로직을 순수 함수로 추출해 테스트하거나, 수동 확인 결과를 보고한다.

## Project Context

프롬프트로 React 컴포넌트를 생성하고 미리보기·코드를 보여주는 데모 앱. 서버 세부 규칙은 `server/AGENTS.md`.

Tech Stack: React 19, TypeScript, Vite, Bun, react-live, Vitest, Testing Library.

## Standards and References

- 설치·실행 방법과 기능 설명은 `README.md`를 따른다. 이 파일에 복제하지 않는다.
- 커밋 메시지: `<type>(<scope>): <한국어 요약>`, type은 `feat`/`fix`/`refactor`/`chore` (`git log` 기준). 커밋은 `.claude/skills/commit` 스킬을 따른다.
- 스킬은 `.claude/skills/`(Claude Code)와 `.agents/skills/`(Codex 공용, gitignore 예외)에 있다. 스킬을 추가·수정하면 두 위치의 동기화 여부를 확인한다.
- 주석과 사용자 노출 문구는 한국어로 작성한다 (기존 코드 기준).

## Maintenance Policy

이 파일의 규칙과 코드가 어긋나면(포트 변경, 테스트 추가, 모델 변경 등) 업데이트를 제안한다. 근거로 적은 파일·라인 번호는 코드 변경 시 다시 확인한다.
