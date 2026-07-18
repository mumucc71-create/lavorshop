import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /공동계약 요청/);
  assert.match(html, /회원 전용 비공개 매칭/);
  assert.match(html, /비회원 모집 비공개/);
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /성남 8월 입주청소 같이 예약/);
  assert.doesNotMatch(html, /상속등기 서류 준비 공동 의뢰/);
});

test("필수 서비스 카테고리와 안전장치를 표시한다", async () => {
  const response = await render();
  const html = await response.text();
  const serviceData = await readFile(new URL("../app/service-data.ts", import.meta.url), "utf8");
  const marketplace = await readFile(new URL("../app/service-marketplace.tsx", import.meta.url), "utf8");

  for (const category of [
    "이사·용달",
    "입주·이사청소",
    "에어컨·가전청소",
    "출장수리·설치",
    "건축·인테리어",
    "화물·운송",
  ]) {
    assert.match(serviceData, new RegExp(category));
  }

  for (const category of ["보험 상담", "법무·법무사", "세무·회계", "부동산·경매", "노무·행정", "특허·상표"]) {
    assert.match(serviceData, new RegExp(category));
  }

  for (const category of ["취업·직무", "과외·교육", "취미·자기계발", "외주", "이벤트·뷰티", "디자인·개발", "자동차", "반려동물"]) {
    assert.match(serviceData, new RegExp(category));
  }

  assert.match(serviceData, /기타·직접 입력/);
  assert.match(marketplace, /서비스 카테고리/);
  assert.match(marketplace, /정확한 서비스명 직접 입력/);
  assert.match(marketplace, /name="serviceName"/);
  assert.match(marketplace, /describesSameService\(input\.serviceName/);
  assert.match(marketplace, /categoriesCanMatch/);
  assert.match(marketplace, /반려견·강아지/);

  assert.match(marketplace, /이 서비스가 이미 있습니다/);
  assert.match(marketplace, /이미 당신의 서비스를 기다리는 사람들이 있습니다/);
  assert.match(marketplace, /아니요, 새로 만들게요/);
  assert.match(marketplace, /아니요, 새로 등록할게요/);
  assert.match(marketplace, /안전 가격 범위를 정해주세요/);
  assert.match(marketplace, /인원별 공동계약 가격을 정해주세요/);
  assert.match(marketplace, /현재 인원 가격으로 바로 할게요/);
  assert.match(marketplace, /가격까지 기다릴게요/);

  assert.match(html, /최초 견적/);
  assert.match(html, /자격 인증/);
  assert.match(html, /비공개 모집/);
  assert.match(html, /목표 인원 달성 전에는 결제가 확정되지 않습니다/);
  assert.match(html, /한 명이 취소해도 나머지 고객의 할인은 유지됩니다/);
});
