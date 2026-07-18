import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("서비스 공동구매 화면을 서버에서 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>같이딜 \| 서비스 공동구매·수요 매칭<\/title>/i);
  assert.match(html, /같이 모이면,[\s\S]*?서비스도 싸져요/);
  assert.match(html, /서비스 요청/);
  assert.match(html, /할인 서비스 등록/);
  assert.match(html, /모이면 할인/);
  assert.match(html, /왕복 할인/);
  assert.match(html, /동네 묶음/);
  assert.match(html, /빈자리 할인/);
  assert.match(html, /가격 제안/);
});

test("필수 서비스 카테고리와 안전장치를 표시한다", async () => {
  const response = await render();
  const html = await response.text();

  for (const category of [
    "이사·용달",
    "입주·이사청소",
    "에어컨·가전청소",
    "출장수리·설치",
    "건축·인테리어",
    "화물·운송",
  ]) {
    assert.match(html, new RegExp(category));
  }

  assert.match(html, /최초 견적/);
  assert.match(html, /사업자 인증/);
  assert.match(html, /목표 인원 달성 전에는 결제가 확정되지 않습니다/);
  assert.match(html, /한 명이 취소해도 나머지 고객의 할인은 유지됩니다/);
});
