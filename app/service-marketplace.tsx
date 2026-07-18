"use client";

import { FormEvent, useMemo, useState } from "react";
import { discountModes, initialServiceDeals, serviceCategories } from "./service-data";
import { describesSameService } from "./service-matching";
import type { DiscountMode, ProviderDealInput, ServiceCategory, ServiceDeal, ServiceRequestInput } from "./service-types";

type RoleView = "customer" | "provider";

const modeLabel = (mode: DiscountMode) => discountModes.find((item) => item.id === mode)?.label ?? mode;
const categoryLabel = (category: ServiceCategory) => serviceCategories.find((item) => item.id === category)?.label ?? category;
const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const categoriesCanMatch = (left: ServiceCategory, right: ServiceCategory) => left === right || left === "custom" || right === "custom";
const referencePrice = (deal: ServiceDeal) => deal.initialQuote || deal.desiredPrice || 100000;
const dealPriceFloor = (deal: ServiceDeal) => deal.priceFloor ?? Math.round(referencePrice(deal) * 0.75 / 1000) * 1000;
const dealPriceCeiling = (deal: ServiceDeal) => deal.priceCeiling ?? Math.round(referencePrice(deal) * 1.3 / 1000) * 1000;
const priceRangesOverlap = (floor: number | undefined, ceiling: number | undefined, deal: ServiceDeal) => {
  if (!floor || !ceiling) return true;
  return Math.max(floor, dealPriceFloor(deal)) <= Math.min(ceiling, dealPriceCeiling(deal));
};
const currentTier = (deal: ServiceDeal) => {
  const tiers = [...(deal.priceTiers ?? [])].sort((left, right) => left.people - right.people);
  return [...tiers].reverse().find((tier) => deal.joined >= tier.people) ?? tiers[0];
};
const targetTier = (deal: ServiceDeal) => [...(deal.priceTiers ?? [])].sort((left, right) => right.people - left.people)[0];

export default function ServiceMarketplace() {
  const [deals, setDeals] = useState<ServiceDeal[]>(initialServiceDeals);
  const [activeCategory, setActiveCategory] = useState<"all" | ServiceCategory>("all");
  const [activeMode, setActiveMode] = useState<"all" | DiscountMode>("all");
  const [roleView, setRoleView] = useState<RoleView>("customer");
  const accessGranted = false;
  const [requestOpen, setRequestOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [providerMode, setProviderMode] = useState<ProviderDealInput["mode"]>("group");
  const [consultDeal, setConsultDeal] = useState<ServiceDeal | null>(null);
  const [rejectDeal, setRejectDeal] = useState<ServiceDeal | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [requestMatch, setRequestMatch] = useState<ServiceDeal | null>(null);
  const [pendingRequest, setPendingRequest] = useState<ServiceRequestInput | null>(null);
  const [providerMatch, setProviderMatch] = useState<ServiceDeal | null>(null);
  const [pendingProvider, setPendingProvider] = useState<ProviderDealInput | null>(null);
  const [priceSetupKind, setPriceSetupKind] = useState<"customer" | "provider" | null>(null);
  const [priceError, setPriceError] = useState("");

  const visibleDeals = useMemo(
    () => accessGranted && activeCategory !== "all"
      ? deals.filter((deal) => deal.category === activeCategory && (activeMode === "all" || deal.mode === activeMode))
      : [],
    [accessGranted, activeCategory, activeMode, deals],
  );

  const openRequest = () => { setSuccessMessage(""); setRequestOpen(true); };
  const openProvider = () => { setSuccessMessage(""); setProviderMode("group"); setProviderOpen(true); };

  const createServiceRequest = (input: ServiceRequestInput) => {
    setDeals((current) => [{
      id: Date.now(), source: "customer", mode: "priceRequest", discountRate: 0,
      approved: 0, target: 3, joined: 1, pending: 0, status: "recruiting", ...input,
    }, ...current]);
    setPendingRequest(null);
    setPriceSetupKind(null);
    setSuccessMessage("새 공동계약 요청이 비공개로 등록됐어요. 조건이 일치하는 고객과 인증 전문가에게만 안내됩니다.");
    setRequestOpen(true);
  };

  const createProviderDeal = (input: ProviderDealInput) => {
    const { providerName, credential, ...dealInput } = input;
    setDeals((current) => [{
      id: Date.now(), source: "provider", approved: 0, joined: 0, pending: 0,
      status: "recruiting", provider: providerName, credential, verified: true, initialQuote: 0, ...dealInput,
    }, ...current]);
    setPendingProvider(null);
    setPriceSetupKind(null);
    setSuccessMessage("새 공동계약 서비스가 비공개로 등록됐어요. 조건이 일치하는 고객에게만 안내됩니다.");
    setProviderOpen(true);
  };

  const findRequestMatch = (input: ServiceRequestInput) => {
    const match = deals.find((deal) => categoriesCanMatch(deal.category, input.category) && deal.status === "recruiting" && describesSameService(input.serviceName, deal.serviceName ?? deal.title) && priceRangesOverlap(input.priceFloor, input.priceCeiling, deal));
    if (match) {
      setPendingRequest(input);
      setRequestMatch(match);
      return;
    }
    createServiceRequest(input);
  };

  const findProviderMatch = (input: ProviderDealInput) => {
    const match = deals.find((deal) => deal.source === "customer" && categoriesCanMatch(deal.category, input.category) && deal.status === "recruiting" && describesSameService(input.serviceName, deal.serviceName ?? deal.title) && priceRangesOverlap(input.priceFloor, input.priceCeiling, deal));
    if (match) {
      setPendingProvider(input);
      setProviderMatch(match);
      return;
    }
    createProviderDeal(input);
  };

  const addServiceRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: ServiceRequestInput = {
      category: String(data.get("category")) as ServiceCategory,
      serviceName: String(data.get("serviceName")).trim(),
      region: String(data.get("region")),
      date: String(data.get("date")),
      title: String(data.get("title")),
      detail: String(data.get("detail")),
      desiredPrice: Number(data.get("desiredPrice")),
    };
    setPendingRequest(input);
    setPriceError("");
    setPriceSetupKind("customer");
    setRequestOpen(false);
  };

  const addProviderDeal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: ProviderDealInput = {
      category: String(data.get("category")) as ServiceCategory,
      serviceName: String(data.get("serviceName")).trim(),
      mode: String(data.get("mode")) as ProviderDealInput["mode"],
      region: String(data.get("region")),
      date: String(data.get("date")),
      title: String(data.get("title")),
      detail: String(data.get("detail")),
      target: Number(data.get("target")),
      discountRate: Number(data.get("discountRate")),
      providerName: String(data.get("providerName") || "신규 인증 전문가·업체"),
      credential: String(data.get("credential") || "자격·사업자 인증 검토"),
      route: String(data.get("route") || "") || undefined,
      reverseRoute: String(data.get("reverseRoute") || "") || undefined,
      vehicleTon: String(data.get("vehicleTon") || "") || undefined,
      workWindow: String(data.get("workWindow") || "") || undefined,
      radius: Number(data.get("radius")) || undefined,
      projectPeriod: String(data.get("projectPeriod") || "") || undefined,
    };
    setPendingProvider(input);
    setPriceError("");
    setPriceSetupKind("provider");
    setProviderOpen(false);
  };

  const submitCustomerPriceRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingRequest) return;
    const data = new FormData(event.currentTarget);
    const priceFloor = Number(data.get("priceFloor"));
    const priceCeiling = Number(data.get("priceCeiling"));
    if (priceFloor > pendingRequest.desiredPrice || pendingRequest.desiredPrice > priceCeiling) {
      setPriceError("희망가격은 하한과 상한 사이에 있어야 합니다.");
      return;
    }
    const input = { ...pendingRequest, priceFloor, priceCeiling };
    setPriceSetupKind(null);
    setPriceError("");
    findRequestMatch(input);
  };

  const submitProviderPriceRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingProvider) return;
    const data = new FormData(event.currentTarget);
    const priceFloor = Number(data.get("priceFloor"));
    const priceCeiling = Number(data.get("priceCeiling"));
    const currentPeople = Number(data.get("currentPeople"));
    const currentPrice = Number(data.get("currentPrice"));
    const targetPeople = Number(data.get("targetPeople"));
    const targetPrice = Number(data.get("targetPrice"));
    if (priceFloor > targetPrice || targetPrice > currentPrice || currentPrice > priceCeiling || targetPeople <= currentPeople) {
      setPriceError("목표 인원 가격은 현재 인원 가격보다 낮아야 하며, 모든 가격은 하한과 상한 사이여야 합니다.");
      return;
    }
    const input = { ...pendingProvider, priceFloor, priceCeiling, target: targetPeople, priceTiers: [{ people: currentPeople, price: currentPrice }, { people: targetPeople, price: targetPrice }] };
    setPriceSetupKind(null);
    setPriceError("");
    findProviderMatch(input);
  };

  const joinSuggestedRequest = () => {
    if (!requestMatch) return;
    setDeals((current) => current.map((deal) => deal.id === requestMatch.id ? { ...deal, joined: deal.joined + 1 } : deal));
    setJoinedIds((current) => current.includes(requestMatch.id) ? current : [...current, requestMatch.id]);
    setRequestMatch(null);
    setPendingRequest(null);
    setSuccessMessage("목표 인원 가격을 기다리는 공동계약에 참여했어요. 인원이 모이면 해당 가격으로 상담이 시작됩니다.");
    setRequestOpen(true);
  };

  const acceptCurrentExpertPrice = () => {
    if (!requestMatch) return;
    setDeals((current) => current.map((deal) => deal.id === requestMatch.id ? { ...deal, joined: deal.joined + 1, pending: deal.pending + 1 } : deal));
    setRequestMatch(null);
    setPendingRequest(null);
    setSuccessMessage("현재 인원 기준 전문가 가격을 선택했어요. 해당 가격 범위로 바로 상담을 진행합니다.");
    setRequestOpen(true);
  };

  const registerSeparateRequest = () => {
    if (!pendingRequest) return;
    const input = pendingRequest;
    setRequestMatch(null);
    setPendingRequest(null);
    createServiceRequest(input);
  };

  const acceptWaitingDemand = () => {
    if (!providerMatch) return;
    setDeals((current) => current.map((deal) => deal.id === providerMatch.id ? { ...deal, pending: deal.pending + 1 } : deal));
    setProviderMatch(null);
    setPendingProvider(null);
    setSuccessMessage("대기 중인 고객에게 공동계약 상담 의사가 전달됐어요. 고객에게는 인증 정보와 필요한 조건만 공개됩니다.");
    setProviderOpen(true);
  };

  const registerSeparateProviderDeal = () => {
    if (!pendingProvider) return;
    const input = pendingProvider;
    setProviderMatch(null);
    setPendingProvider(null);
    createProviderDeal(input);
  };

  const joinDemand = (id: number) => {
    if (joinedIds.includes(id)) return;
    setDeals((current) => current.map((deal) => deal.id === id ? { ...deal, joined: deal.joined + 1 } : deal));
    setJoinedIds((current) => [...current, id]);
  };

  const submitConsultation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consultDeal || appliedIds.includes(consultDeal.id)) return;
    setDeals((current) => current.map((deal) => deal.id === consultDeal.id ? { ...deal, pending: deal.pending + 1 } : deal));
    setAppliedIds((current) => [...current, consultDeal.id]);
    setConsultDeal(null);
  };

  const approveLatest = (id: number) => {
    setDeals((current) => current.map((deal) => {
      if (deal.id !== id || deal.pending < 1 || deal.status === "contracted") return deal;
      const approved = deal.approved + 1;
      return { ...deal, approved, pending: deal.pending - 1, status: approved >= deal.target ? "contracted" : "recruiting" };
    }));
  };

  const recordUnavailable = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectDeal) return;
    const reason = String(new FormData(event.currentTarget).get("reason"));
    setDeals((current) => current.map((deal) => deal.id === rejectDeal.id ? { ...deal, unavailableReason: reason, pending: Math.max(0, deal.pending - 1) } : deal));
    setRejectDeal(null);
  };

  const matchedCurrentTier = requestMatch ? currentTier(requestMatch) : undefined;
  const matchedTargetTier = requestMatch ? targetTier(requestMatch) : undefined;
  const sharedPriceFloor = requestMatch && pendingRequest ? Math.max(pendingRequest.priceFloor ?? 0, dealPriceFloor(requestMatch)) : 0;
  const sharedPriceCeiling = requestMatch && pendingRequest ? Math.min(pendingRequest.priceCeiling ?? Number.MAX_SAFE_INTEGER, dealPriceCeiling(requestMatch)) : 0;
  const matchedCurrentPriceAllowed = Boolean(matchedCurrentTier && matchedCurrentTier.price >= sharedPriceFloor && matchedCurrentTier.price <= sharedPriceCeiling);

  return <main>
    <header className="topbar serviceTopbar">
      <a className="brand" href="#top" aria-label="같이딜 홈"><span className="brandMark">같이</span><span><strong>같이딜</strong><small>서비스 수요 매칭</small></span></a>
      <nav aria-label="주요 메뉴"><a href="#top">홈</a><a href="#services">서비스 딜</a><a href="#safety">안전 거래</a></nav>
      <div className="headerActions serviceHeaderActions">
        <button className="bulkHeaderButton" onClick={openRequest}>고객 · 서비스 요청</button>
        <button className="accountButton sellerButton" onClick={openProvider}>전문가·업체 · 공동계약 등록</button>
      </div>
    </header>

    <section className="hero serviceHero" id="top">
      <div className="heroCopy">
        <span className="eyebrow"><i /> 생활 서비스부터 전문가까지, 함께 찾아요</span>
        <h1>같이 모이면,<br />서비스도 싸져요.</h1>
        <p>같은 서비스가 필요한 사람을 모으고, 업체의 빈 시간과 이동 경로를 연결해 절감된 비용을 고객 할인으로 돌려드립니다.</p>
        <div className="heroActions"><button className="primary" onClick={openRequest}>공동계약 요청 <span>→</span></button><button className="secondaryAction" onClick={openProvider}>공동계약 등록</button></div>
        <div className="guarantee"><span>✓</span>비회원 모집 비공개 · 일치 회원에게만 노출 · 견적·연락처 1:1 보호</div>
      </div>
      <div className="heroCard serviceHeroCard" role="presentation">
        <div className="routeMap"><span>대전</span><b>↔</b><span>천안</span></div>
        <div className="floatBadge"><b>2건</b><span> 자동 매칭</span><small>반대 이동 경로를 찾았어요</small></div>
        <div className="priceTag"><small>왕복 공동 할인</small><strong>12<span>%</span></strong></div>
        <div className="dots"><span /><span /><span /></div>
      </div>
    </section>

    <section className="deals section" id="services">
      <div className="sectionHead serviceSectionHead"><div><span className="sectionKicker">PRIVATE MATCHING</span><h2>필요한 사람에게만 보이는 공동계약</h2><p>로그인 후 본인의 분야와 일치하는 모집만 확인할 수 있습니다.</p></div>{accessGranted && <div className="roleSwitch" aria-label="데모 화면 역할"><button className={roleView === "customer" ? "active" : ""} onClick={() => setRoleView("customer")}>고객 화면</button><button className={roleView === "provider" ? "active" : ""} onClick={() => setRoleView("provider")}>전문가·업체 화면</button></div>}</div>

      {!accessGranted && <div className="privateGate"><span>🔒</span><div><b>회원 전용 비공개 매칭</b><p>익숙한 카테고리를 고르고 정확한 서비스명은 직접 입력하세요. 맞는 분야가 없으면 ‘기타·직접 입력’을 선택할 수 있으며, 조건이 일치할 때 기존 공동계약 1건만 제한적으로 추천합니다. 모집 목록·견적·연락처는 공개하지 않습니다.</p><div><button className="primary" onClick={openRequest}>필요한 서비스 요청</button><button className="secondaryAction" onClick={openProvider}>전문가·업체 공동계약 등록</button></div></div></div>}

      {accessGranted && <>
        <div className="matchPrivacyNotice">🔐 현재 선택한 분야와 일치하는 비공개 모집만 표시됩니다. 다른 회원의 이름·연락처·개별 견적은 볼 수 없습니다.</div>
        <div className="filterBlock"><b>할인 방식</b><div className="categoryBar modeBar">{discountModes.map((mode) => <button key={mode.id} className={activeMode === mode.id ? "active" : ""} onClick={() => setActiveMode(mode.id)}><span>{mode.emoji}</span>{mode.label}</button>)}</div></div>
        <div className="filterBlock"><b>생활 서비스</b><div className="categoryBar">{serviceCategories.filter((category) => category.group !== "expert").map((category) => <button key={category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)}><span>{category.emoji}</span>{category.label}</button>)}</div></div>
        <div className="filterBlock expertFilter"><b>전문가 찾기</b><div className="categoryBar">{serviceCategories.filter((category) => category.group === "expert").map((category) => <button key={category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)}><span>{category.emoji}</span>{category.label}</button>)}</div></div>
      </>}

      <div className="serviceGrid">
        {visibleDeals.map((deal) => {
          const remaining = Math.max(0, deal.target - deal.approved);
          const progress = deal.status === "contracted" ? 100 : Math.min(100, Math.round((deal.approved / deal.target) * 100));
          return <article className="dealCard serviceCard" data-deal-id={deal.id} data-source={deal.source} key={deal.id}>
            <div className={`serviceCardTop ${deal.mode}`}><span className="dealBadge">{modeLabel(deal.mode)}</span><span className="serviceEmoji">{serviceCategories.find((item) => item.id === deal.category)?.emoji}</span><small>{categoryLabel(deal.category)}</small></div>
            <div className="dealInfo">
              <div className="serviceMeta"><span>📍 {deal.region}</span><span>🗓 {deal.date}</span></div>
              <div className="seller">{deal.source === "provider" ? deal.provider : "고객 공동계약 제안"} {deal.verified && <em>✓ {deal.credential ?? "사업자 인증"}</em>}</div>
              <h3>{deal.title}</h3><p className="serviceDetail">{deal.detail}</p>
              {deal.route && <div className="routeDetail"><b>{deal.route}</b>{deal.reverseRoute && <><span>자동 탐색</span><b>{deal.reverseRoute}</b></>}{deal.vehicleTon && <small>{deal.vehicleTon} · {deal.workWindow}</small>}</div>}
              {deal.mode === "neighborhood" && <div className="privacyInfo">동 단위 공개 · 반경 {deal.radius}km · {deal.projectPeriod}</div>}
              {deal.desiredPrice && <div className="desiredPrice"><span>희망가격</span><b>{formatWon(deal.desiredPrice)}</b></div>}
              {deal.discountRate > 0 && <div className="discountSummary"><b>{deal.discountRate}% 할인</b><span>고객별 확정 견적에 동일 할인율 적용</span></div>}
              <div className="progressLabel"><strong>승인 {deal.approved}명 / 목표 {deal.target}명</strong><span>{deal.status === "contracted" ? "계약 성사" : `${remaining}명 남음`}</span></div>
              <div className="progress"><span style={{ width: `${progress}%` }} /></div>
              <div className="dealStates"><span>{deal.source === "customer" ? "전문가 상담" : "상담 신청"} {deal.pending}건</span><span>참여 수요 {deal.joined}명</span></div>
              {deal.unavailableReason && <div className="unavailableReason">최근 불가능 사유 · {deal.unavailableReason}</div>}
              {deal.status === "contracted" && <div className="contractedNotice">✓ 목표 달성 · 계약 성사 · 이후 1명 취소에도 나머지 확정 할인 유지</div>}
              <div className="quoteLock">🔒 최초 견적 기록 · 확정 후 임의 인상 방지</div>
              <div className="cardActions">
                {roleView === "customer" && deal.source === "customer" && <button className="primary" disabled={joinedIds.includes(deal.id)} onClick={() => joinDemand(deal.id)}>{joinedIds.includes(deal.id) ? "참여 완료" : "저도요"}</button>}
                {roleView === "customer" && deal.source === "provider" && <button className="primary" disabled={appliedIds.includes(deal.id) || deal.status === "contracted"} onClick={() => setConsultDeal(deal)}>{appliedIds.includes(deal.id) ? "상담 신청 완료" : deal.status === "contracted" ? "계약 성사" : "상담 신청"}</button>}
                {roleView === "provider" && deal.source === "customer" && <button className="primary" disabled={appliedIds.includes(deal.id)} onClick={() => setConsultDeal(deal)}>{appliedIds.includes(deal.id) ? "상담 신청 완료" : "공동계약 상담 신청"}</button>}
                {roleView === "provider" && deal.source === "provider" && <><button className="primary" disabled={deal.pending < 1 || deal.status === "contracted"} onClick={() => approveLatest(deal.id)}>최근 신청 가능 승인</button><button className="secondaryAction small" disabled={deal.pending < 1} onClick={() => setRejectDeal(deal)}>불가능 처리</button></>}
              </div>
            </div>
          </article>;
        })}
      </div>
      {accessGranted && visibleDeals.length === 0 && <div className="emptyState">분야를 선택하면 해당 회원에게 허용된 공동계약 모집만 표시됩니다.</div>}
    </section>

    <section className="how section serviceHow" id="how"><div className="howIntro"><span className="sectionKicker">HOW IT WORKS</span><h2>전문가는 찾기 쉽게,<br />계약은 함께</h2></div><div className="steps">{[["01","🔎","분야 선택","로그인 후 필요한 생활 서비스나 전문가 분야를 선택합니다."],["02","🔒","비공개 매칭","조건이 일치하는 고객과 인증 전문가에게만 모집을 보여줍니다."],["03","%","공동 계약","승인 인원이 모이면 고객별 확정 견적에 공동계약 할인이 적용됩니다."]].map((step, index) => <div className="step" key={step[0]}><span className="stepNumber">{step[0]}</span><div className={`stepIcon step${index}`}>{step[1]}</div><div><h3>{step[2]}</h3><p>{step[3]}</p></div></div>)}</div></section>

    <section className="section safetySection" id="safety"><div className="sectionHead"><div><span className="sectionKicker">SAFE MATCHING</span><h2>안전한 서비스 공동계약</h2><p>고객 정보와 견적을 보호하고, 목표 달성 전에는 결제를 확정하지 않습니다.</p></div></div><div className="safetyGrid">{[
      ["🔒","견적 잠금","할인 전 최초 견적을 기록하고 확정 후 임의 인상을 막습니다."],
      ["✓","자격 인증","사업자등록과 법무사·세무사·노무사 등 분야별 자격을 확인합니다."],
      ["📍","주소 보호","고객끼리는 이름·연락처를 볼 수 없고 동 단위만 공개합니다."],
      ["🧾","사유 기록","취소 사유와 상담 불가능 사유를 기록합니다."],
      ["💳","결제 보류","목표 인원 달성 전에는 결제가 확정되지 않습니다."],
      ["🛡","할인 유지","성사 후 한 명이 취소해도 나머지 고객의 할인은 유지됩니다."],
      ["⭐","실거래 후기","거래 완료가 확인된 고객만 후기를 작성할 수 있습니다."],
      ["⏱","자동 미성사","마감일까지 목표 미달이면 계약 미성사로 자동 처리합니다."],
      ["🙈","비공개 모집","비회원과 조건이 맞지 않는 회원에게는 모집·견적을 노출하지 않습니다."],
      ["⚖️","규정 준수","보험·법무·세무 등은 관련 자격과 보수·광고 규정에 따라 개별 계약합니다."],
      ["↕️","가격 안전범위","과도한 덤핑과 과다 청구를 막기 위해 승인된 하한·상한 안에서만 제안합니다."],
      ["👥","인원별 가격","현재 인원 가격과 목표 인원 가격을 함께 기록해 재흥정과 분쟁을 줄입니다."],
    ].map((item) => <article key={item[1]}><span>{item[0]}</span><div><b>{item[1]}</b><p>{item[2]}</p></div></article>)}</div></section>

    <footer><div className="brand footerBrand"><span className="brandMark">같이</span><span><strong>같이딜</strong><small>Better services together</small></span></div><p>© 2026 GACHIDEAL · 작동형 데모</p></footer>

    {requestOpen && <div className="overlay" onMouseDown={() => setRequestOpen(false)}><section className="sheet sellerSheet" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="서비스 요청 등록"><button className="sheetClose" onClick={() => setRequestOpen(false)}>×</button>{!successMessage ? <><span className="sectionKicker">CUSTOMER REQUEST</span><h2>이 가격에 해주세요</h2><p className="sheetProduct">같은 서비스가 필요한 고객이 ‘저도요’로 모일 수 있습니다.</p><form className="form sellerForm" onSubmit={addServiceRequest}><div className="formRow"><label>서비스 카테고리<select name="category" required>{serviceCategories.filter((item) => item.id !== "all").map((item) => <option value={item.id} key={item.id}>{item.emoji} {item.label}</option>)}</select></label><label>지역 (동 단위)<input name="region" required placeholder="예: 서울 송파구 잠실동" /></label></div><label>정확한 서비스명 직접 입력<input name="serviceName" required placeholder="예: 강아지 미용, 반려견 미용" /></label><div className="formRow"><label>희망 날짜<input name="date" type="date" required /></label><label>희망가격<input name="desiredPrice" type="number" min="10000" step="1000" required placeholder="120000" /></label></div><label>요청 제목<input name="title" required placeholder="예: 반려견 미용 같이 하실 분" /></label><label>작업 내용<textarea name="detail" required placeholder="상세주소와 연락처는 입력하지 마세요. 작업 규모와 조건만 작성해 주세요." /></label><p className="notice">ⓘ ‘반려견·강아지’처럼 표현이 달라도 유사어를 자동으로 연결합니다. 맞는 카테고리가 없으면 ‘기타·직접 입력’을 선택하세요.</p><button className="primary joinButton">서비스 요청 등록</button></form></> : <Success message={successMessage} onClose={() => setRequestOpen(false)} />}</section></div>}

    {providerOpen && <div className="overlay" onMouseDown={() => setProviderOpen(false)}><section className="sheet sellerSheet" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="할인 서비스 등록"><button className="sheetClose" onClick={() => setProviderOpen(false)}>×</button>{!successMessage ? <><span className="sectionKicker">VERIFIED PROVIDER</span><h2>할인 서비스 등록</h2><p className="sheetProduct">승인한 고객만 목표 인원에 포함되며 고객별 확정 견적에는 같은 할인율이 적용됩니다.</p><form className="form sellerForm" onSubmit={addProviderDeal}><div className="formRow"><label>할인 방식<select name="mode" value={providerMode} onChange={(event) => setProviderMode(event.target.value as ProviderDealInput["mode"])}><option value="group">모이면 할인</option><option value="roundTrip">왕복 할인</option><option value="neighborhood">동네 묶음 할인</option><option value="emptySlot">빈자리 할인</option></select></label><label>서비스 카테고리<select name="category">{serviceCategories.filter((item) => item.id !== "all").map((item) => <option value={item.id} key={item.id}>{item.emoji} {item.label}</option>)}</select></label></div><label>정확한 서비스명 직접 입력<input name="serviceName" required placeholder="예: 개인사업자 종합소득세 신고" /></label><div className="formRow"><label>가능 지역<input name="region" required placeholder="예: 경기 성남시 분당구" /></label><label>가능 날짜·기간<input name="date" required placeholder="예: 2026-08-10 ~ 08-20" /></label></div><div className="formRow"><label>목표 승인 인원<input name="target" type="number" min="2" max="100" defaultValue="3" required /></label><label>할인율<input name="discountRate" type="number" min="1" max="50" defaultValue="10" required /></label></div><label>공동계약 제목<input name="title" required placeholder="예: 종합소득세 신고 공동계약" /></label><label>조건 설명<textarea name="detail" required placeholder="적용 범위, 작업 조건, 고객별 견적 방식 등을 적어 주세요." /></label>{providerMode === "roundTrip" && <><div className="formRow"><label>가는 경로<input name="route" required placeholder="대전 → 천안" /></label><label>반대 경로<input name="reverseRoute" required placeholder="천안 → 대전" /></label></div><div className="formRow"><label>차량 톤수<input name="vehicleTon" required placeholder="1톤" /></label><label>작업 종료·상하차 시간<input name="workWindow" required placeholder="12:30 종료 · 각 60분" /></label></div></>}{providerMode === "neighborhood" && <div className="formRow"><label>작업 반경(km)<input name="radius" type="number" min="1" max="30" required /></label><label>공사 기간<input name="projectPeriod" required placeholder="8월 17일~30일" /></label></div>}<p className="notice">ⓘ 맞는 카테고리가 없으면 ‘기타·직접 입력’을 선택하세요. 목표 달성 전에는 결제를 확정할 수 없습니다.</p><button className="primary joinButton">할인 서비스 등록</button></form></> : <Success message={successMessage} onClose={() => setProviderOpen(false)} />}</section></div>}

    {priceSetupKind === "customer" && pendingRequest && <div className="overlay"><section className="sheet matchSheet" role="dialog" aria-modal="true" aria-label="고객 안전 가격 설정"><button className="sheetClose" onClick={() => { setPriceSetupKind(null); setRequestOpen(true); }}>×</button><span className="sectionKicker">SAFE PRICE</span><h2>안전 가격 범위를 정해주세요</h2><p className="sheetProduct">지나치게 낮거나 높은 제안은 매칭하지 않습니다.</p><form className="form" onSubmit={submitCustomerPriceRange}><div className="formRow"><label>가격 하한<input name="priceFloor" type="number" min="10000" step="1000" defaultValue={Math.max(10000, Math.round(pendingRequest.desiredPrice * 0.8 / 1000) * 1000)} required /></label><label>가격 상한<input name="priceCeiling" type="number" min="10000" step="1000" defaultValue={Math.round(pendingRequest.desiredPrice * 1.25 / 1000) * 1000} required /></label></div><div className="priceRule"><span>내 희망가격</span><b>{formatWon(pendingRequest.desiredPrice)}</b></div>{priceError && <p className="priceError">{priceError}</p>}<p className="notice">ⓘ 희망가격이 안전 범위 안에 있어야 하며, 전문가 가격 범위와 겹칠 때만 공동계약을 추천합니다.</p><button className="primary joinButton">이 범위로 매칭 확인</button></form></section></div>}

    {priceSetupKind === "provider" && pendingProvider && <div className="overlay"><section className="sheet matchSheet" role="dialog" aria-modal="true" aria-label="전문가 인원별 가격 설정"><button className="sheetClose" onClick={() => { setPriceSetupKind(null); setProviderOpen(true); }}>×</button><span className="sectionKicker">TIERED PRICE</span><h2>인원별 공동계약 가격을 정해주세요</h2><p className="sheetProduct">현재 인원 가격과 목표 인원 가격을 동시에 제안합니다.</p><form className="form" onSubmit={submitProviderPriceRange}><div className="formRow"><label>가격 하한<input name="priceFloor" type="number" min="10000" step="1000" defaultValue="100000" required /></label><label>가격 상한<input name="priceCeiling" type="number" min="10000" step="1000" defaultValue="500000" required /></label></div><div className="formRow"><label>현재 기준 인원<input name="currentPeople" type="number" min="1" max="99" defaultValue="3" required /></label><label>현재 인원 1인 가격<input name="currentPrice" type="number" min="10000" step="1000" defaultValue="300000" required /></label></div><div className="formRow"><label>목표 인원<input name="targetPeople" type="number" min="2" max="100" defaultValue="10" required /></label><label>목표 인원 1인 가격<input name="targetPrice" type="number" min="10000" step="1000" defaultValue="200000" required /></label></div>{priceError && <p className="priceError">{priceError}</p>}<p className="notice">ⓘ 고객은 목표 인원까지 기다리거나 현재 인원 가격으로 바로 진행할 수 있습니다. 범위 밖 가격은 제안할 수 없습니다.</p><button className="primary joinButton">가격 단계 등록 후 대기 수요 확인</button></form></section></div>}

    {requestMatch && <div className="overlay"><section className="sheet matchSheet" role="dialog" aria-modal="true" aria-label="기존 공동계약 추천"><span className="sectionKicker">PRIVATE MATCH</span><h2>이 서비스가 이미 있습니다</h2><p className="sheetProduct">가격으로 다투지 않도록 안전 범위와 인원별 가격을 함께 보여드립니다.</p><div className="matchSummary"><span>{serviceCategories.find((item) => item.id === requestMatch.category)?.emoji}</span><div><b>{requestMatch.title}</b><p>{categoryLabel(requestMatch.category)} · {requestMatch.region}</p><small>{requestMatch.date} · 현재 참여 수요 {requestMatch.joined}명</small></div></div><div className="priceNegotiation"><div><span>합의 가능한 안전 범위</span><b>{formatWon(sharedPriceFloor)} ~ {formatWon(sharedPriceCeiling)}</b></div>{matchedCurrentTier && <div className={matchedCurrentPriceAllowed ? "" : "outsideRange"}><span>{matchedCurrentTier.people}명 이상일 때</span><b>{formatWon(matchedCurrentTier.price)}{!matchedCurrentPriceAllowed && " · 범위 밖"}</b></div>}{matchedTargetTier && matchedTargetTier.people !== matchedCurrentTier?.people && <div className="targetDeal"><span>{matchedTargetTier.people}명까지 기다리면</span><b>{formatWon(matchedTargetTier.price)}</b></div>}</div><p className="notice">ⓘ 범위 밖 가격은 선택할 수 없습니다. 다른 회원의 이름·연락처·개별 견적은 공개하지 않습니다.</p><div className="matchChoices priceChoices">{matchedTargetTier && matchedTargetTier.people > requestMatch.joined && <button className="primary" onClick={joinSuggestedRequest}>{matchedTargetTier.people}명 가격까지 기다릴게요</button>}{matchedCurrentTier && matchedCurrentPriceAllowed && <button className="primary currentPriceButton" onClick={acceptCurrentExpertPrice}>현재 인원 가격으로 바로 할게요</button>}{!matchedCurrentTier && <button className="primary" onClick={joinSuggestedRequest}>네, 함께 할게요</button>}<button className="secondaryAction" onClick={registerSeparateRequest}>아니요, 새로 만들게요</button></div></section></div>}

    {providerMatch && pendingProvider && <div className="overlay"><section className="sheet matchSheet" role="dialog" aria-modal="true" aria-label="대기 수요 추천"><span className="sectionKicker">PRIVATE DEMAND</span><h2>이미 당신의 서비스를 기다리는 사람들이 있습니다</h2><p className="sheetProduct">설정한 안전 범위와 인원별 가격으로 공동계약을 제안할 수 있습니다.</p><div className="matchSummary"><span>{serviceCategories.find((item) => item.id === providerMatch.category)?.emoji}</span><div><b>{providerMatch.title}</b><p>{categoryLabel(providerMatch.category)} · {providerMatch.region}</p><small>{providerMatch.date} · 현재 참여 수요 {providerMatch.joined}명</small></div></div><div className="priceNegotiation"><div><span>전문가 제안 가능 범위</span><b>{formatWon(pendingProvider.priceFloor ?? 0)} ~ {formatWon(pendingProvider.priceCeiling ?? 0)}</b></div>{pendingProvider.priceTiers?.map((tier) => <div className={tier.people === pendingProvider.target ? "targetDeal" : ""} key={tier.people}><span>{tier.people}명일 때 1인 가격</span><b>{formatWon(tier.price)}</b></div>)}</div><p className="notice">ⓘ 고객은 목표 인원까지 기다리거나 현재 인원 가격으로 바로 진행할 수 있습니다. 범위 밖 재흥정은 제한됩니다.</p><div className="matchChoices"><button className="primary" onClick={acceptWaitingDemand}>이 가격 단계로 제안할게요</button><button className="secondaryAction" onClick={registerSeparateProviderDeal}>아니요, 새로 등록할게요</button></div></section></div>}

    {consultDeal && <div className="overlay" onMouseDown={() => setConsultDeal(null)}><section className="sheet" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="상담 신청"><button className="sheetClose" onClick={() => setConsultDeal(null)}>×</button><span className="sectionKicker">CONSULTATION</span><h2>{consultDeal.source === "customer" ? "인증 업체 상담 신청" : "서비스 상담 신청"}</h2><p className="sheetProduct">{consultDeal.title}</p><form className="form" onSubmit={submitConsultation}><label>{consultDeal.source === "customer" ? "업체명" : "신청자 이름"}<input name="name" required /></label><label>연락처<input name="contact" required placeholder="010-0000-0000" /></label><label>상담 내용<textarea name="summary" required placeholder="상담에 필요한 작업 조건만 작성해 주세요." /></label><label className="consentCheck"><input type="checkbox" required /><span>상담을 위해 인증된 상대방에게 상세정보를 제공하는 데 동의합니다.</span></label><p className="notice">ⓘ 상담 신청만으로 목표 인원에 포함되지 않습니다. 업체가 가능 처리하고 최초 견적을 확정해야 승인 인원으로 계산됩니다.</p><button className="primary joinButton">상담 신청</button></form></section></div>}

    {rejectDeal && <div className="overlay" onMouseDown={() => setRejectDeal(null)}><section className="sheet" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="불가능 처리"><button className="sheetClose" onClick={() => setRejectDeal(null)}>×</button><span className="sectionKicker">PROVIDER DECISION</span><h2>상담 불가능 처리</h2><p className="sheetProduct">{rejectDeal.title}</p><form className="form" onSubmit={recordUnavailable}><label>불가능 사유<textarea name="reason" required placeholder="예: 해당 날짜의 장비 일정이 이미 마감되었습니다." /></label><p className="notice">ⓘ 사유는 기록되며 고객에게 공개될 수 있으므로 개인정보를 입력하지 마세요.</p><button className="primary joinButton">사유 기록 후 불가능 처리</button></form></section></div>}
  </main>;
}

function Success({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="success"><div>✓</div><h2>등록 완료</h2><p>{message}</p><button className="primary" onClick={onClose}>확인</button></div>;
}
