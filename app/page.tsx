"use client";

import { FormEvent, useMemo, useState } from "react";

type Language = "ko" | "en";
type Role = "buyer" | "seller";
type Product = { emoji: string; ko: string; en: string; price: number; original: number; joined: number; time: [number, number]; color: string; seller: string };

const copy = {
  ko: {
    brandSub: "100명이 만드는 특별한 가격", nav: ["홈", "공구 상품", "이용방법"], language: "English",
    signup: "회원가입", sellerCenter: "상품 등록", buyerAccount: "구매자 계정", sellerAccount: "판매자 계정",
    eyebrow: "1명부터 100명까지 내려가는 가격", heroTitle: "모일수록,\n가격이 내려가요", heroBody: "1명 가격부터 시작해 참여자가 늘어날수록 저렴해지고, 100명에서 정확히 50%가 돼요.",
    seeDeal: "가격 확인하기", guarantee: "1~100명 단계별 가격 · 100명 달성 시 50% 할인 · 1인 최대 3개",
    live: "진행 중인 공구", all: "전체보기", people: "명 참여", left: "명 남았어요", achieved: "달성", deadline: "마감", days: "일", hours: "시간", group: "100명 공구가",
    stepsTitle: "공구, 이렇게 쉬워요", step1: "상품을 고르고", step1Body: "마음에 드는 공구를 찾아보세요.", step2: "절반만 결제", step2Body: "공구가의 50%로 참여를 예약해요.", step3: "100명 달성!", step3Body: "나머지 50% 결제 후 배송돼요.",
    sheetTitle: "공동구매 참여하기", quantity: "구매 수량", total: "선택 인원 가격의 50% 선결제", pricePreview: "예상 인원별 가격 보기", personPrice: "명 예상 가격", priceGuide: "구매자는 슬라이더로 1~100명 가격을 미리 확인할 수 있습니다. 실제 가격은 최종 참여 인원으로 자동 확정됩니다.", paymentNote: "지금 선택 인원 예상가의 50%를 선결제하고, 모집 종료 후 확정가의 나머지 금액을 결제합니다. 1인 최대 3개입니다.", join: "공구 참여 예약하기", success: "참여 예약이 완료됐어요!", successBody: "선결제가 예약됐습니다. 모집 종료 후 최종 참여 인원에 따라 가격이 확정됩니다.", close: "확인",
    accountTitle: "어떤 목적으로 가입하시나요?", accountBody: "가입 유형에 따라 필요한 기능을 보여드려요.", buyer: "구매자", buyerDesc: "공구 상품을 구매하고 배송을 받아요", seller: "판매자", sellerDesc: "직접 상품을 올리고 주문을 관리해요", name: "이름 또는 상호명", email: "이메일", createAccount: "가입 완료하기",
    productTitle: "새 공구 상품 등록", productBody: "정상가를 입력하면 1~100명 가격표가 자동 생성되고, 100명 가격은 정상가의 50%가 됩니다.", productName: "상품명", sellerName: "판매자명", originalPrice: "정상 판매가", dealPrice: "100명 최종가 (자동 50%)", category: "상품 종류", deadlineLabel: "모집 기간", register: "상품 등록하기", registered: "상품이 등록됐어요!", registeredBody: "등록한 상품이 공구 목록에 바로 표시됩니다.", demo: "샘플에서는 현재 화면에만 등록 내용이 유지됩니다.", required: "모든 정보를 입력해 주세요.",
  },
  en: {
    brandSub: "A special price made by 100 people", nav: ["Home", "Deals", "How it works"], language: "한국어",
    signup: "Sign up", sellerCenter: "Add product", buyerAccount: "Buyer account", sellerAccount: "Seller account",
    eyebrow: "A falling price from 1 to 100 people", heroTitle: "More people,\nlower prices", heroBody: "The price drops as people join, reaching exactly 50% off at 100.",
    seeDeal: "Check the price", guarantee: "Prices for 1–100 people · 50% off at 100 · Maximum 3 per person",
    live: "Active group deals", all: "View all", people: " joined", left: " more to go", achieved: "reached", deadline: "Ends in", days: "d", hours: "h", group: "100-person price",
    stepsTitle: "Group buying made easy", step1: "Pick a product", step1Body: "Find a deal you love.", step2: "Pay only half", step2Body: "Reserve with 50% of the deal price.", step3: "Reach 100!", step3Body: "Pay the rest and get it delivered.",
    sheetTitle: "Join this group deal", quantity: "Purchase quantity", total: "50% deposit at selected estimate", pricePreview: "Preview price by group size", personPrice: "-person estimated price", priceGuide: "Move the slider to preview prices from 1 to 100 people. The final price is automatically based on actual participants.", paymentNote: "Pay 50% of the selected estimate now. The remaining amount is settled after the final participant count. Maximum 3 items per person.", join: "Reserve my spot", success: "Your spot is reserved!", successBody: "Your deposit is reserved. The final price will be based on the participant count when recruitment ends.", close: "Done",
    accountTitle: "How will you use Baekdeal?", accountBody: "We’ll show features that match your account type.", buyer: "Buyer", buyerDesc: "Join deals and receive deliveries", seller: "Seller", sellerDesc: "List your own products and manage orders", name: "Name or business name", email: "Email", createAccount: "Create account",
    productTitle: "List a new group deal", productBody: "Enter retail price to generate a 1–100 person price curve ending at 50% off.", productName: "Product name", sellerName: "Seller name", originalPrice: "Retail price", dealPrice: "100-person final price (50%)", category: "Product type", deadlineLabel: "Deal duration", register: "List product", registered: "Product listed!", registeredBody: "Your product now appears in the deal list.", demo: "In this demo, new listings remain only on the current screen.", required: "Please complete all fields.",
  },
};

const initialProducts: Product[] = [
  { emoji: "🍳", ko: "올스텐 인덕션 프라이팬 2종", en: "All-steel induction pan set", price: 39900, original: 79800, joined: 84, time: [0, 18], color: "peach", seller: "키친웍스" },
  { emoji: "☕", ko: "스페셜티 드립백 커피 30개", en: "Specialty drip coffee 30-pack", price: 24900, original: 49800, joined: 72, time: [1, 6], color: "cream", seller: "모닝로스터스" },
  { emoji: "🧺", ko: "호텔 수건 프리미엄 10장", en: "Premium hotel towels, set of 10", price: 29900, original: 59800, joined: 96, time: [0, 9], color: "mint", seller: "코지라이프" },
];

const won = (n: number, lang: Language) => lang === "ko" ? `${n.toLocaleString("ko-KR")}원` : `₩${n.toLocaleString("en-US")}`;
const priceAtCount = (product: Product, count: number) => {
  const safeCount = Math.max(1, Math.min(100, count));
  const rate = .95 - ((safeCount - 1) * .45 / 99);
  return Math.round((product.original * rate) / 100) * 100;
};

export default function Home() {
  const [lang, setLang] = useState<Language>("ko");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selected, setSelected] = useState(0);
  const [dealOpen, setDealOpen] = useState(false);
  const [dealSuccess, setDealSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [previewCount, setPreviewCount] = useState(1);
  const [accountOpen, setAccountOpen] = useState(false);
  const [role, setRole] = useState<Role>("buyer");
  const [account, setAccount] = useState<{role: Role; name: string} | null>(null);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [sellerSuccess, setSellerSuccess] = useState(false);
  const [formError, setFormError] = useState(false);
  const [retail, setRetail] = useState(60000);
  const t = copy[lang];
  const product = products[selected];
  const previewPrice = useMemo(() => priceAtCount(product, previewCount), [product, previewCount]);
  const deposit = useMemo(() => previewPrice * quantity / 2, [previewPrice, quantity]);

  const openDeal = (index: number) => { setSelected(index); setQuantity(1); setPreviewCount(Math.max(1, products[index].joined)); setDealSuccess(false); setDealOpen(true); };
  const signup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get("name") || "");
    setAccount({ role, name }); setAccountOpen(false); if (role === "seller") setSellerOpen(true);
  };
  const addProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get("product") || ""); const seller = String(data.get("seller") || "");
    if (!name || !seller || !retail) { setFormError(true); return; }
    const category = String(data.get("category") || "📦"); const duration = Number(data.get("duration") || 3);
    setProducts(prev => [{ emoji: category, ko: name, en: name, price: retail / 2, original: retail, joined: 0, time: [duration, 0], color: "lavender", seller }, ...prev]);
    setFormError(false); setSellerSuccess(true);
  };

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="백딜 홈"><span className="brandMark">100</span><span><strong>백딜</strong><small>{t.brandSub}</small></span></a>
      <nav aria-label="주 메뉴">{t.nav.map((item, i) => <a key={item} href={i === 0 ? "#top" : i === 1 ? "#deals" : "#how"}>{item}</a>)}</nav>
      <div className="headerActions">
        <button className="langButton" onClick={() => setLang(lang === "ko" ? "en" : "ko")}><span>🌐</span> {t.language}</button>
        {!account ? <button className="accountButton" onClick={() => setAccountOpen(true)}>{t.signup}</button> : account.role === "seller" ? <button className="accountButton sellerButton" onClick={() => {setSellerSuccess(false); setSellerOpen(true);}}>＋ {t.sellerCenter}</button> : <span className="accountPill">● {t.buyerAccount}</span>}
      </div>
    </header>

    <section className="hero" id="top"><div className="heroCopy"><span className="eyebrow"><i /> {t.eyebrow}</span><h1>{t.heroTitle}</h1><p>{t.heroBody}</p><button className="primary" onClick={() => openDeal(Math.min(2, products.length - 1))}>{t.seeDeal} <span>→</span></button><div className="guarantee"><span>✓</span>{t.guarantee}</div></div><div className="heroCard" role="presentation"><div className="floatBadge"><b>96</b><span>/ 100</span><small>{lang === "ko" ? "거의 다 모였어요!" : "Almost there!"}</small></div><div className="productVisual">🧺</div><div className="priceTag"><small>{t.group}</small><strong>29,900<span>{lang === "ko" ? "원" : " KRW"}</span></strong></div><div className="dots"><span /><span /><span /></div></div></section>

    <section className="deals section" id="deals"><div className="sectionHead"><div><span className="sectionKicker">LIVE DEALS</span><h2>{t.live}</h2></div><a href="#deals">{t.all} →</a></div><div className="dealGrid">
      {products.map((p, index) => { const currentPrice=priceAtCount(p,Math.max(1,p.joined)); const discount=Math.round((1-currentPrice/p.original)*100); return <article className="dealCard" key={`${p.ko}-${index}`} onClick={() => openDeal(index)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openDeal(index)}><div className={`dealImage ${p.color}`}><span className="dealBadge">{100-p.joined}{t.left}</span><span className="emoji">{p.emoji}</span><button aria-label="찜하기" onClick={(e) => e.stopPropagation()}>♡</button></div><div className="dealInfo"><div className="seller">{p.seller}</div><h3>{lang === "ko" ? p.ko : p.en}</h3><div className="prices"><b>{discount}%</b><strong>{won(currentPrice, lang)}</strong><del>{won(p.original, lang)}</del></div><div className="progressLabel"><strong>{p.joined}{t.people}</strong><span>{p.joined}% {t.achieved}</span></div><div className="progress"><span style={{width:`${p.joined}%`}} /></div><div className="timer">◷ {t.deadline} <b>{p.time[0]}{t.days} {p.time[1]}{t.hours}</b></div></div></article>})}
    </div></section>

    <section className="how section" id="how"><div className="howIntro"><span className="sectionKicker">HOW IT WORKS</span><h2>{t.stepsTitle}</h2></div><div className="steps">{[["01","⌕",t.step1,t.step1Body],["02","▣",t.step2,t.step2Body],["03","✓",t.step3,t.step3Body]].map((s,i)=><div className="step" key={s[0]}><span className="stepNumber">{s[0]}</span><div className={`stepIcon step${i}`}>{s[1]}</div><div><h3>{s[2]}</h3><p>{s[3]}</p></div></div>)}</div></section>
    <footer><div className="brand footerBrand"><span className="brandMark">100</span><span><strong>백딜</strong><small>Better together</small></span></div><p>© 2026 BAEKDEAL · Demo service</p></footer>

    {dealOpen && <div className="overlay" onMouseDown={()=>setDealOpen(false)}><section className="sheet" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><button className="sheetClose" onClick={()=>setDealOpen(false)}>×</button>{!dealSuccess ? <><span className="sheetEmoji">{product.emoji}</span><span className="sectionKicker">{product.seller}</span><h2>{t.sheetTitle}</h2><p className="sheetProduct">{lang === "ko" ? product.ko : product.en}</p><div className="sheetProgress"><div><b>{product.joined}{lang === "ko" ? "명" : ""}</b><span>/ 100</span></div><div className="progress"><span style={{width:`${product.joined}%`}} /></div><small>{100-product.joined}{t.left}</small></div><div className="priceSimulator"><div><span>{t.pricePreview}</span><strong>{previewCount}{t.personPrice} · {won(previewPrice,lang)}</strong></div><input aria-label={t.pricePreview} type="range" min="1" max="100" value={previewCount} onChange={e=>setPreviewCount(Number(e.target.value))}/><div className="rangeLabels"><span>1{lang==="ko"?"명":""} · {won(priceAtCount(product,1),lang)}</span><span>100{lang==="ko"?"명":""} · {won(product.price,lang)}</span></div><small>{t.priceGuide}</small></div><div className="quantity"><span>{t.quantity} <small>{lang === "ko" ? "(최대 3개)" : "(max 3)"}</small></span><div><button onClick={()=>setQuantity(Math.max(1,quantity-1))} disabled={quantity===1}>−</button><b>{quantity}</b><button onClick={()=>setQuantity(Math.min(3,quantity+1))} disabled={quantity===3}>＋</button></div></div><div className="total"><span>{t.total}</span><div><del>{lang === "ko" ? `예상 총액 ${won(previewPrice*quantity,lang)}` : `Estimated total ${won(previewPrice*quantity,lang)}`}</del><strong>{won(deposit,lang)}</strong><b>50%</b></div></div><p className="notice">ⓘ {t.paymentNote}</p><button className="primary joinButton" onClick={()=>setDealSuccess(true)}>{t.join}</button></> : <div className="success"><div>✓</div><h2>{t.success}</h2><p>{t.successBody}</p><button className="primary" onClick={()=>setDealOpen(false)}>{t.close}</button></div>}</section></div>}

    {accountOpen && <div className="overlay" onMouseDown={()=>setAccountOpen(false)}><section className="sheet accountSheet" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><button className="sheetClose" onClick={()=>setAccountOpen(false)}>×</button><span className="sectionKicker">JOIN BAEKDEAL</span><h2>{t.accountTitle}</h2><p className="sheetProduct">{t.accountBody}</p><div className="roleGrid"><button className={role==="buyer"?"active":""} onClick={()=>setRole("buyer")}><span>🛍️</span><b>{t.buyer}</b><small>{t.buyerDesc}</small></button><button className={role==="seller"?"active":""} onClick={()=>setRole("seller")}><span>🏪</span><b>{t.seller}</b><small>{t.sellerDesc}</small></button></div><form onSubmit={signup} className="form"><label>{t.name}<input name="name" required placeholder={role==="seller"?(lang==="ko"?"예: 백딜상회":"e.g. Baekdeal Store"):(lang==="ko"?"이름 입력":"Enter your name")} /></label><label>{t.email}<input name="email" type="email" required placeholder="name@example.com" /></label><button className="primary joinButton">{t.createAccount}</button></form></section></div>}

    {sellerOpen && <div className="overlay" onMouseDown={()=>setSellerOpen(false)}><section className="sheet sellerSheet" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><button className="sheetClose" onClick={()=>setSellerOpen(false)}>×</button>{!sellerSuccess ? <><span className="sectionKicker">SELLER CENTER</span><h2>{t.productTitle}</h2><p className="sheetProduct">{t.productBody}</p><form onSubmit={addProduct} className="form sellerForm"><div className="formRow"><label>{t.productName}<input name="product" placeholder={lang==="ko"?"등록할 상품명":"Product name"} /></label><label>{t.sellerName}<input name="seller" defaultValue={account?.name || ""} /></label></div><div className="formRow"><label>{t.originalPrice}<input name="retail" type="number" min="1000" step="100" value={retail} onChange={e=>setRetail(Number(e.target.value))} /></label><label>{t.dealPrice}<output>{won(retail/2,lang)}</output></label></div><div className="formRow"><label>{t.category}<select name="category"><option value="📦">📦 {lang==="ko"?"생활":"Living"}</option><option value="🍽️">🍽️ {lang==="ko"?"식품":"Food"}</option><option value="💄">💄 {lang==="ko"?"뷰티":"Beauty"}</option><option value="👕">👕 {lang==="ko"?"패션":"Fashion"}</option><option value="💻">💻 {lang==="ko"?"디지털":"Digital"}</option></select></label><label>{t.deadlineLabel}<select name="duration"><option value="3">3{t.days}</option><option value="5">5{t.days}</option><option value="7">7{t.days}</option></select></label></div>{formError&&<p className="formError">{t.required}</p>}<p className="notice">ⓘ {t.demo}</p><button className="primary joinButton">{t.register}</button></form></> : <div className="success"><div>✓</div><h2>{t.registered}</h2><p>{t.registeredBody}</p><button className="primary" onClick={()=>setSellerOpen(false)}>{t.close}</button></div>}</section></div>}
  </main>;
}
