"use client";

import { useMemo, useState } from "react";

type Language = "ko" | "en";

const copy = {
  ko: {
    brandSub: "100명이 만드는 특별한 가격",
    nav: ["홈", "카테고리", "마이공구"],
    language: "English",
    eyebrow: "오늘의 마감 임박 공구",
    heroTitle: "같이 사면,\n가격이 달라져요",
    heroBody: "모든 상품은 정가의 50%. 지금 절반만 결제하고, 100명 달성 후 나머지를 결제해요.",
    seeDeal: "지금 참여하기",
    guarantee: "무조건 50% 할인 · 1인 최대 3개 · 미달 시 선결제 자동 환불",
    live: "실시간 인기 공구",
    all: "전체보기",
    people: "명 참여",
    left: "명 남았어요",
    achieved: "달성",
    deadline: "마감",
    days: "일",
    hours: "시간",
    normal: "일반가",
    group: "100명 공구가",
    stepsTitle: "공구, 이렇게 쉬워요",
    step1: "상품을 고르고",
    step1Body: "마음에 드는 공구를 찾아보세요.",
    step2: "미리 결제하면",
    step2Body: "안전하게 참여가 예약돼요.",
    step3: "100명 달성!",
    step3Body: "최저가 확정 후 배송이 시작돼요.",
    sheetTitle: "공동구매 참여하기",
    quantity: "수량",
    total: "오늘 선결제 금액 (공구가의 50%)",
    paymentNote: "100명 달성 후 나머지 50%를 결제합니다. 1인 최대 3개까지 구매할 수 있습니다. 샘플 화면이므로 실제 결제는 진행되지 않습니다.",
    join: "공구 참여 예약하기",
    success: "참여 예약이 완료됐어요!",
    successBody: "공구가의 50% 선결제가 예약됐습니다. 100명 달성 후 나머지 50%를 결제합니다.",
    close: "확인",
  },
  en: {
    brandSub: "A special price made by 100 people",
    nav: ["Home", "Categories", "My Deals"],
    language: "한국어",
    eyebrow: "Ending soon today",
    heroTitle: "Buy together,\npay less",
    heroBody: "Every item is 50% off. Pay half now and the other half when 100 people join.",
    seeDeal: "Join the deal",
    guarantee: "Always 50% off · Maximum 3 per person · Deposit refunded if the deal fails",
    live: "Trending group deals",
    all: "View all",
    people: " joined",
    left: " more to go",
    achieved: "reached",
    deadline: "Ends in",
    days: "d",
    hours: "h",
    normal: "Regular",
    group: "100-person price",
    stepsTitle: "Group buying made easy",
    step1: "Pick a product",
    step1Body: "Find a deal you love.",
    step2: "Reserve payment",
    step2Body: "Secure your spot safely.",
    step3: "Reach 100!",
    step3Body: "Shipping starts at the lowest price.",
    sheetTitle: "Join this group deal",
    quantity: "Quantity",
    total: "Pay today (50% of deal price)",
    paymentNote: "Pay the remaining 50% after 100 people join. Maximum 3 items per person. This is a demo; no actual payment will be made.",
    join: "Reserve my spot",
    success: "Your spot is reserved!",
    successBody: "Your 50% deposit is reserved. Pay the remaining 50% once the deal reaches 100 people.",
    close: "Done",
  },
};

const products = [
  { emoji: "🍳", ko: "올스텐 인덕션 프라이팬 2종", en: "All-steel induction pan set", price: 39900, original: 79800, joined: 84, time: [0, 18], color: "peach" },
  { emoji: "☕", ko: "스페셜티 드립백 커피 30개", en: "Specialty drip coffee 30-pack", price: 24900, original: 49800, joined: 72, time: [1, 6], color: "cream" },
  { emoji: "🧺", ko: "호텔 수건 프리미엄 10장", en: "Premium hotel towels, set of 10", price: 29900, original: 59800, joined: 96, time: [0, 9], color: "mint" },
];

const won = (n: number, lang: Language) => lang === "ko" ? `${n.toLocaleString("ko-KR")}원` : `₩${n.toLocaleString("en-US")}`;

export default function Home() {
  const [lang, setLang] = useState<Language>("ko");
  const [selected, setSelected] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const t = copy[lang];
  const product = products[selected];
  const deposit = useMemo(() => product.price * quantity / 2, [product, quantity]);

  const openDeal = (index: number) => {
    setSelected(index);
    setQuantity(1);
    setSheet(true);
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="백딜 홈">
          <span className="brandMark">100</span>
          <span><strong>백딜</strong><small>{t.brandSub}</small></span>
        </a>
        <nav aria-label="주 메뉴">
          {t.nav.map((item, i) => <a key={item} href={i === 0 ? "#top" : i === 1 ? "#deals" : "#how"}>{item}</a>)}
        </nav>
        <button className="langButton" onClick={() => setLang(lang === "ko" ? "en" : "ko")} aria-label="언어 변경">
          <span>🌐</span> {t.language}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy">
          <span className="eyebrow"><i /> {t.eyebrow}</span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroBody}</p>
          <button className="primary" onClick={() => openDeal(2)}>{t.seeDeal} <span>→</span></button>
          <div className="guarantee"><span>✓</span>{t.guarantee}</div>
        </div>
        <div className="heroCard" role="presentation">
          <div className="floatBadge"><b>96</b><span>/ 100</span><small>{lang === "ko" ? "거의 다 모였어요!" : "Almost there!"}</small></div>
          <div className="productVisual">🧺</div>
          <div className="priceTag"><small>{t.group}</small><strong>29,900<span>{lang === "ko" ? "원" : " KRW"}</span></strong></div>
          <div className="dots"><span /><span /><span /></div>
        </div>
      </section>

      <section className="deals section" id="deals">
        <div className="sectionHead"><div><span className="sectionKicker">LIVE DEALS</span><h2>{t.live}</h2></div><a href="#deals">{t.all} →</a></div>
        <div className="dealGrid">
          {products.map((p, index) => {
            const pct = p.joined;
            return <article className="dealCard" key={p.ko} onClick={() => openDeal(index)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openDeal(index)}>
              <div className={`dealImage ${p.color}`}><span className="dealBadge">{100 - p.joined}{t.left}</span><span className="emoji">{p.emoji}</span><button aria-label="찜하기" onClick={(e) => e.stopPropagation()}>♡</button></div>
              <div className="dealInfo">
                <div className="seller">BAEKDEAL SELECT</div>
                <h3>{lang === "ko" ? p.ko : p.en}</h3>
                <div className="prices"><b>50%</b><strong>{won(p.price, lang)}</strong><del>{won(p.original, lang)}</del></div>
                <div className="progressLabel"><strong>{p.joined}{lang === "ko" ? t.people : t.people}</strong><span>{pct}% {t.achieved}</span></div>
                <div className="progress"><span style={{width: `${pct}%`}} /></div>
                <div className="timer">◷ {t.deadline} <b>{p.time[0]}{t.days} {p.time[1]}{t.hours}</b></div>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="how section" id="how">
        <div className="howIntro"><span className="sectionKicker">HOW IT WORKS</span><h2>{t.stepsTitle}</h2></div>
        <div className="steps">
          {[["01", "⌕", t.step1, t.step1Body], ["02", "▣", t.step2, t.step2Body], ["03", "✓", t.step3, t.step3Body]].map((step, i) =>
            <div className="step" key={step[0]}><span className="stepNumber">{step[0]}</span><div className={`stepIcon step${i}`}>{step[1]}</div><div><h3>{step[2]}</h3><p>{step[3]}</p></div></div>
          )}
        </div>
      </section>

      <footer><div className="brand footerBrand"><span className="brandMark">100</span><span><strong>백딜</strong><small>Better together</small></span></div><p>© 2026 BAEKDEAL · Demo service</p></footer>

      {sheet && <div className="overlay" onMouseDown={() => setSheet(false)}>
        <section className="sheet" onMouseDown={(e) => e.stopPropagation()} aria-modal="true" role="dialog">
          <button className="sheetClose" onClick={() => setSheet(false)} aria-label="닫기">×</button>
          {!success ? <>
            <span className="sheetEmoji">{product.emoji}</span><span className="sectionKicker">BAEKDEAL</span><h2>{t.sheetTitle}</h2><p className="sheetProduct">{lang === "ko" ? product.ko : product.en}</p>
            <div className="sheetProgress"><div><b>{product.joined}{lang === "ko" ? "명" : ""}</b><span>/ 100</span></div><div className="progress"><span style={{width: `${product.joined}%`}} /></div><small>{100-product.joined}{t.left}</small></div>
            <div className="quantity"><span>{t.quantity} <small>{lang === "ko" ? "(최대 3개)" : "(max 3)"}</small></span><div><button onClick={() => setQuantity(Math.max(1, quantity-1))} disabled={quantity === 1}>−</button><b>{quantity}</b><button onClick={() => setQuantity(Math.min(3, quantity+1))} disabled={quantity === 3}>＋</button></div></div>
            <div className="total"><span>{t.total}</span><div><del>{lang === "ko" ? `공구가 ${won(product.price*quantity, lang)}` : `Deal total ${won(product.price*quantity, lang)}`}</del><strong>{won(deposit, lang)}</strong><b>50%</b></div></div>
            <p className="notice">ⓘ {t.paymentNote}</p>
            <button className="primary joinButton" onClick={() => setSuccess(true)}>{t.join}</button>
          </> : <div className="success"><div>✓</div><h2>{t.success}</h2><p>{t.successBody}</p><button className="primary" onClick={() => { setSuccess(false); setSheet(false); }}>{t.close}</button></div>}
        </section>
      </div>}
    </main>
  );
}
