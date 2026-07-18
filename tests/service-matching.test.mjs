import assert from "node:assert/strict";
import test from "node:test";

import { describesSameService, normalizeServiceText } from "../app/service-matching.ts";

test("반려견과 강아지처럼 뜻이 같은 표현을 연결한다", () => {
  assert.equal(describesSameService("반려견 미용", "강아지 미용"), true);
  assert.equal(describesSameService("애견 호텔", "반려견호텔"), true);
  assert.equal(describesSameService("댕댕이 산책", "강아지 도그워킹"), true);
});

test("서비스 종류가 다른 경우에는 같은 반려동물 분야라도 연결하지 않는다", () => {
  assert.equal(describesSameService("반려견 미용", "강아지 산책"), false);
  assert.equal(describesSameService("고양이 돌봄", "강아지 미용"), false);
});

test("생활·전문가 서비스의 흔한 줄임말과 표현 차이를 정규화한다", () => {
  assert.equal(normalizeServiceText("종소세 신고"), "종합소득세 신고");
  assert.equal(describesSameService("에어컨 청소", "냉방기 클리닝"), true);
  assert.equal(describesSameService("부가세 신고", "부가가치세 세금신고"), true);
});

