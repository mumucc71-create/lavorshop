const genericServiceWords = new Set([
  "공동",
  "계약",
  "요청",
  "서비스",
  "상담",
  "할인",
  "같이",
  "해주세요",
  "진행",
  "신고",
]);

const synonymGroups = [
  ["반려견", "강아지", "애견", "댕댕이", "강쥐"],
  ["반려묘", "고양이", "냥이"],
  ["반려동물", "펫", "애완동물"],
  ["미용", "그루밍"],
  ["돌봄", "펫시팅", "펫시터", "베이비시팅"],
  ["산책", "도그워킹"],
  ["청소", "클리닝"],
  ["입주청소", "새집청소"],
  ["에어컨", "냉방기"],
  ["이사", "이삿짐", "포장이사", "가정이사"],
  ["용달", "소형이사", "원룸이사"],
  ["화물", "운송", "배송"],
  ["수리", "고장수리", "에이에스"],
  ["설치", "시공"],
  ["도배", "벽지시공"],
  ["장판", "바닥재시공"],
  ["자동차", "차량", "승용차"],
  ["세무", "세금신고", "세무신고"],
  ["종합소득세", "종소세"],
  ["부가가치세", "부가세"],
  ["법무사", "법무대행"],
  ["부동산경매", "경매물건", "법원경매"],
  ["노무", "인사노무"],
  ["특허", "특허출원"],
  ["상표", "상표출원"],
] as const;

const synonymReplacements = synonymGroups
  .flatMap(([canonical, ...aliases]) => aliases.map((alias) => [alias, canonical] as const))
  .sort(([left], [right]) => right.length - left.length);

export const normalizeServiceText = (value: string) => {
  let normalized = value.toLowerCase().normalize("NFKC");
  for (const [alias, canonical] of synonymReplacements) {
    normalized = normalized.replaceAll(alias, canonical);
  }
  return normalized;
};

const serviceWords = (value: string) => normalizeServiceText(value)
  .split(/[\s·/↔→~(),]+/)
  .map((word) => word.replace(/[^0-9a-z가-힣]/g, ""))
  .filter((word) => word.length >= 2 && !genericServiceWords.has(word));

export const describesSameService = (left: string, right: string) => {
  const normalizedLeft = normalizeServiceText(left).replace(/[^0-9a-z가-힣]/g, "");
  const normalizedRight = normalizeServiceText(right).replace(/[^0-9a-z가-힣]/g, "");
  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;

  const leftWords = serviceWords(left);
  const rightWords = serviceWords(right);
  if (!leftWords.length || !rightWords.length) return false;

  const rightText = normalizedRight;
  const matchedWords = new Set(leftWords.filter((word) => rightText.includes(word)));
  const requiredMatches = Math.min(2, leftWords.length, rightWords.length);
  return matchedWords.size >= requiredMatches;
};
