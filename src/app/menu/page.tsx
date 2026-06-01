"use client";
import { useEffect } from "react";

export default function MenuPage() {
  useEffect(() => {
    // Splash screen
    const timer = setTimeout(() => {
      const splash = document.getElementById("splash");
      if (splash) splash.classList.add("gone");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  function go(id: string, btn: HTMLButtonElement) {
    document.querySelectorAll<HTMLElement>(".sec").forEach((s) => s.classList.remove("on"));
    document.querySelectorAll<HTMLElement>(".tab").forEach((t) => t.classList.remove("active"));
    const section = document.getElementById(id);
    if (section) section.classList.add("on");
    btn.classList.add("active");
    const nav = document.getElementById("nav");
    if (nav) nav.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&family=Cinzel:wght@400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --ink:#08090a;
          --deep:#0d0e0c;
          --card:#111310;
          --lift:#181a16;
          --edge:#1f211c;
          --gold:#c8a44a;
          --gold-lt:#e2bc6e;
          --gold-pale:#f0d898;
          --cream:#f2ebe0;
          --mist:rgba(242,235,224,0.5);
          --fog:rgba(242,235,224,0.22);
          --teal:#1b6b6a;
          --forest:#1c4a28;
          --coral:#c05030;
          --sep:rgba(200,164,74,0.15);
          --r:10px;
          --rl:18px;
        }
        html{scroll-behavior:smooth}
        .menu-page{background:var(--ink);color:var(--cream);font-family:'DM Sans',sans-serif;font-weight:300;min-height:100vh;overflow-x:hidden;-webkit-tap-highlight-color:transparent}
        ::selection{background:var(--gold);color:var(--ink)}

        /* ── GRAIN ── */
        .menu-page::after{content:'';position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.04;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size:180px}

        /* ── SPLASH ── */
        #splash{position:fixed;inset:0;z-index:9999;background:var(--ink);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;
        transition:opacity .8s ease,visibility .8s}
        #splash.gone{opacity:0;visibility:hidden;pointer-events:none}
        .sp-name{font-family:'Cinzel',serif;font-size:clamp(2.2rem,9vw,4rem);color:var(--gold);letter-spacing:.12em;
        opacity:0;animation:rise .9s .3s forwards}
        .sp-line{width:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);
        animation:grow 1s .7s forwards}
        .sp-sub{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:var(--mist);
        opacity:0;animation:rise .8s .9s forwards}
        @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes grow{to{width:130px}}

        /* ── HERO ── */
        .hero{position:relative;min-height:56svh;display:flex;flex-direction:column;
        align-items:center;justify-content:center;padding:3.5rem 1.5rem 3rem;
        text-align:center;overflow:hidden}
        .hero-bg{position:absolute;inset:0;pointer-events:none}
        .hero-bg::before{content:'';position:absolute;inset:0;
        background:radial-gradient(ellipse 120% 70% at 20% 30%,rgba(27,107,106,.28),transparent 65%),
        radial-gradient(ellipse 100% 60% at 80% 70%,rgba(200,164,74,.1),transparent 65%),
        radial-gradient(ellipse 80% 50% at 50% 0%,rgba(28,74,40,.22),transparent 60%)}
        .hero-grid{position:absolute;inset:0;
        background-image:linear-gradient(rgba(200,164,74,.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(200,164,74,.04) 1px,transparent 1px);
        background-size:52px 52px}
        .hero-content{position:relative;z-index:2}
        .h-tag{font-size:9px;font-weight:500;letter-spacing:5px;text-transform:uppercase;
        color:var(--gold);margin-bottom:1.2rem;opacity:0;animation:rise .8s 1.6s forwards}
        .h-name{font-family:'Cinzel',serif;font-size:clamp(2.8rem,13vw,6rem);
        letter-spacing:.08em;line-height:.95;margin-bottom:.3rem;
        opacity:0;animation:rise 1s 1.8s forwards}
        .h-name span{display:block;
        background:linear-gradient(140deg,var(--gold-pale) 0%,var(--gold) 35%,var(--gold-lt) 65%,var(--gold) 100%);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .h-name em{font-style:italic;font-family:'Cormorant Garamond',serif;font-weight:300;
        font-size:.85em;color:rgba(242,235,224,.7);-webkit-text-fill-color:rgba(242,235,224,.7);display:block}
        .h-loc{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1rem,4vw,1.3rem);
        color:var(--mist);margin:.8rem 0 2rem;opacity:0;animation:rise .8s 2s forwards}
        .h-divider{display:flex;align-items:center;gap:.75rem;justify-content:center;margin-bottom:2rem;
        opacity:0;animation:rise .8s 2.1s forwards}
        .h-divider::before,.h-divider::after{content:'';width:60px;height:1px}
        .h-divider::before{background:linear-gradient(90deg,transparent,var(--gold))}
        .h-divider::after{background:linear-gradient(90deg,var(--gold),transparent)}
        .h-gem{width:5px;height:5px;background:var(--gold);transform:rotate(45deg)}
        .h-btn{display:inline-flex;align-items:center;gap:.5rem;
        padding:.8rem 2rem;border:1px solid var(--gold);
        color:var(--gold);font-size:10px;font-weight:500;letter-spacing:3px;
        text-transform:uppercase;cursor:pointer;background:transparent;
        border-radius:2px;transition:all .35s;position:relative;overflow:hidden;
        opacity:0;animation:rise .8s 2.2s forwards;font-family:'DM Sans',sans-serif}
        .h-btn::before{content:'';position:absolute;inset:0;background:var(--gold);
        transform:scaleX(0);transform-origin:left;transition:transform .35s;z-index:-1}
        .h-btn:hover::before{transform:scaleX(1)}
        .h-btn:hover{color:var(--ink)}

        /* ── NAV ── */
        .mnav{position:sticky;top:0;z-index:800;
        background:rgba(8,9,10,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
        border-bottom:1px solid var(--sep)}
        .nav-inner{display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none;padding:0 .25rem}
        .nav-inner::-webkit-scrollbar{display:none}
        .nav-brand{font-family:'Cinzel',serif;font-size:.85rem;color:var(--gold);
        letter-spacing:.1em;white-space:nowrap;padding:.9rem .9rem .9rem .6rem;
        border-right:1px solid var(--sep);margin-right:.25rem;flex-shrink:0;
        display:flex;align-items:center}
        .tab{border:none;background:none;padding:.9rem .75rem;
        font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;
        letter-spacing:2px;text-transform:uppercase;color:var(--fog);
        cursor:pointer;white-space:nowrap;position:relative;transition:color .25s;flex-shrink:0}
        .tab::after{content:'';position:absolute;bottom:0;left:50%;
        transform:translateX(-50%);width:0;height:1.5px;background:var(--gold);transition:width .3s}
        .tab.active{color:var(--gold)}
        .tab.active::after{width:60%}
        .tab:hover:not(.active){color:var(--mist)}

        /* ── MAIN ── */
        .mmain{max-width:680px;margin:0 auto;padding:2rem 1rem 6rem}
        .sec{display:none}
        .sec.on{display:block;animation:secIn .4s ease both}
        @keyframes secIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

        /* ── SECTION HEADER ── */
        .sec-head{padding-bottom:1.5rem;margin-bottom:2rem;border-bottom:1px solid var(--sep)}
        .sec-tag{font-size:9px;font-weight:500;letter-spacing:4px;text-transform:uppercase;
        color:var(--gold);margin-bottom:.5rem}
        .sec-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,8vw,3rem);
        font-weight:400;line-height:1;color:var(--cream)}
        .sec-title em{font-style:italic;color:var(--gold)}

        /* ── CATEGORY RULE ── */
        .cat{display:flex;align-items:center;gap:.6rem;margin:2rem 0 .85rem}
        .cat-txt{font-size:8.5px;font-weight:600;letter-spacing:4px;text-transform:uppercase;
        color:var(--gold);white-space:nowrap}
        .cat-line{flex:1;height:1px;background:var(--sep)}

        /* ── ITEMS LIST ── */
        .list{display:flex;flex-direction:column;border:1px solid var(--sep);
        border-radius:var(--rl);overflow:hidden;background:var(--sep)}
        .row{background:var(--card);display:flex;align-items:center;
        justify-content:space-between;padding:1rem 1.1rem;gap:.9rem;
        transition:background .2s;min-height:52px}
        .row+.row{border-top:1px solid var(--sep)}
        .row:active{background:var(--lift)}
        .row-l{flex:1;min-width:0;display:flex;align-items:flex-start;gap:.65rem}
        .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px}
        .dv{background:#5abf7a;box-shadow:0 0 7px rgba(90,191,122,.45)}
        .dn{background:#e07060;box-shadow:0 0 7px rgba(224,112,96,.45)}
        .da{background:var(--gold);box-shadow:0 0 7px rgba(200,164,74,.45)}
        .row-name{font-family:'Cormorant Garamond',serif;font-size:1.05rem;
        font-weight:500;color:var(--cream);line-height:1.25}
        .row-price{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;
        color:var(--gold);flex-shrink:0;white-space:nowrap;letter-spacing:.02em}
        .row-price.dash{color:var(--fog);font-size:.9rem}

        /* ── DRINK CARDS ── */
        .drink-list{display:flex;flex-direction:column;gap:.75rem}
        .drink-card{background:var(--card);border:1px solid var(--sep);border-radius:var(--r);
        padding:1rem 1.2rem;transition:border-color .25s,background .2s;position:relative;overflow:hidden}
        .drink-card::before{content:'';position:absolute;top:0;left:0;width:2px;height:100%;
        background:linear-gradient(180deg,var(--gold),transparent)}
        .drink-card:active{background:var(--lift)}
        .drink-top{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;margin-bottom:.3rem}
        .drink-name{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;
        color:var(--cream);letter-spacing:.02em}
        .drink-desc{font-size:11px;color:var(--mist);line-height:1.6;font-weight:300}

        /* ── BAR LIST ── */
        .bar-list{display:flex;flex-direction:column;border:1px solid var(--sep);
        border-radius:var(--rl);overflow:hidden;background:var(--sep)}
        .bar-row{background:var(--card);display:flex;align-items:center;
        justify-content:space-between;padding:.8rem 1.1rem;gap:.75rem}
        .bar-row+.bar-row{border-top:1px solid var(--sep)}
        .bar-row:active{background:var(--lift)}
        .bar-name{font-size:.9rem;color:var(--cream);font-weight:300}
        .bar-price{font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--gold);flex-shrink:0}

        /* ── PRICE NOTE ── */
        .p-note{font-size:10px;color:var(--fog);text-align:center;margin-top:.75rem;
        font-style:italic;letter-spacing:.5px}

        /* ── LEGEND ── */
        .legend{display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;
        padding:.65rem 1rem;background:var(--card);border:1px solid var(--sep);
        border-radius:var(--r)}
        .lg-item{display:flex;align-items:center;gap:.45rem;font-size:10px;color:var(--fog)}

        /* ── FOOTER ── */
        .mfooter{text-align:center;padding:2.5rem 1rem 2rem;border-top:1px solid var(--sep);margin-top:3rem}
        .footer-brand{font-family:'Cinzel',serif;font-size:1.3rem;color:var(--gold);
        letter-spacing:.1em;margin-bottom:.75rem}
        .mfooter p{font-size:11px;color:var(--fog);line-height:2.1}
        .mfooter strong{color:var(--mist);font-weight:500}
        .f-gem{display:flex;align-items:center;justify-content:center;gap:.6rem;margin-bottom:1rem}
        .f-gem::before,.f-gem::after{content:'';width:45px;height:1px}
        .f-gem::before{background:linear-gradient(90deg,transparent,var(--gold))}
        .f-gem::after{background:linear-gradient(90deg,var(--gold),transparent)}
        .f-gem-d{width:5px;height:5px;background:var(--gold);transform:rotate(45deg)}
      `}</style>

      <div className="menu-page">

        {/* SPLASH */}
        <div id="splash">
          <p className="sp-name">Cola Goa</p>
          <div className="sp-line" />
          <p className="sp-sub">Beach Resort · South Goa</p>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-content">
            <p className="h-tag">Cola Beach · South Goa</p>
            <h1 className="h-name">
              <span>Cola</span>
              <span>Goa</span>
            </h1>
            <p className="h-loc">Beach Resort · Dining Menu</p>
            <div className="h-divider"><div className="h-gem" /></div>
            <button
              className="h-btn"
              onClick={() => {
                document.getElementById("nav")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Menu &nbsp;↓
            </button>
          </div>
        </section>

        {/* NAV */}
        <nav className="mnav" id="nav">
          <div className="nav-inner">
            <span className="nav-brand">Menu</span>
            <button className="tab active" onClick={(e) => go("starters", e.currentTarget)}>Starters</button>
            <button className="tab" onClick={(e) => go("mains", e.currentTarget)}>Mains</button>
            <button className="tab" onClick={(e) => go("rice", e.currentTarget)}>Rice</button>
            <button className="tab" onClick={(e) => go("noodles", e.currentTarget)}>Noodles</button>
            <button className="tab" onClick={(e) => go("cocktails", e.currentTarget)}>Cocktails</button>
            <button className="tab" onClick={(e) => go("mocktails", e.currentTarget)}>Mocktails</button>
            <button className="tab" onClick={(e) => go("bar", e.currentTarget)}>Bar</button>
          </div>
        </nav>

        <main className="mmain">

          {/* ═══ STARTERS ═══ */}
          <section className="sec on" id="starters">
            <div className="sec-head">
              <p className="sec-tag">To Begin</p>
              <h2 className="sec-title">Star<em>ters</em></h2>
            </div>
            <div className="legend">
              <div className="lg-item"><div className="dot dv" />Veg</div>
              <div className="lg-item"><div className="dot dn" />Non-Veg</div>
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Veg</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["French Fries", "₹ 250"], ["Masala Papad", "₹ 200"], ["Veg Pakoda", "₹ 280"],
                ["Paneer Pakoda", "₹ 350"], ["Onion Bajji", "₹ 270"], ["Gobi Manchurian", "₹ 300"],
                ["Chilli Paneer", "₹ 350"],
              ].map(([name, price]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className="dot dv" /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Non Veg</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Crispy Chicken", "₹ 400"], ["Chilli Chicken", "₹400"], ["Chicken Manchurian", "₹400"],
                ["Prawns Chilli", "₹450"], ["Prawns Golden Fry", "₹450"], ["Golden Fry Kalamari", "₹400"],
                ["Squid Chilli", "₹400"], ["Squid Tempura", "₹400"], ["Chicken Choila", "₹450"],
              ].map(([name, price]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className="dot dn" /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ MAIN COURSE ═══ */}
          <section className="sec" id="mains">
            <div className="sec-head">
              <p className="sec-tag">From the Kitchen</p>
              <h2 className="sec-title">Main <em>Course</em></h2>
            </div>
            <div className="legend">
              <div className="lg-item"><div className="dot dv" />Veg</div>
              <div className="lg-item"><div className="dot dn" />Non-Veg</div>
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Veg</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Dal Fry / Dal Tadka", "₹ 300"], ["Dal Palak", "₹350"], ["Chana Masala", "₹350"],
                ["Rajma Masala", "₹350"], ["Mixed Veg Masala", "₹400"], ["Veg Kolhapuri", "₹400"],
                ["Mushroom Masala", "₹400"], ["Alu Gobi", "₹400"], ["Palak Paneer", "₹450"],
                ["Kadai Paneer", "₹450"],
              ].map(([name, price]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className="dot dv" /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Non Veg</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Chicken Masala", "₹450"], ["Chicken Kolhapuri", "₹450"], ["Chicken Kadai", "₹450"],
                ["Butter Chicken", "₹500"], ["Prawns Masala", "₹500"], ["Fish Masala", "₹450"],
                ["Mix Sea Food Masala", "₹500"],
              ].map(([name, price]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className="dot dn" /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ RICE & BIRYANI ═══ */}
          <section className="sec" id="rice">
            <div className="sec-head">
              <p className="sec-tag">Grains &amp; Biryani</p>
              <h2 className="sec-title">Rice &amp; <em>Biryani</em></h2>
            </div>
            <div className="legend">
              <div className="lg-item"><div className="dot dv" />Veg</div>
              <div className="lg-item"><div className="dot dn" />Non-Veg</div>
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Veg</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Steam Rice", "₹150"], ["Jeera Rice", "₹200"], ["Coconut Rice", "₹250"],
                ["Veg Fried Rice", "₹300"], ["Veg Schezwan Fried Rice", "₹350"],
                ["Veg Pulao", "₹350"], ["Veg Biryani", "₹400"],
              ].map(([name, price]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className="dot dv" /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Non Veg</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Chicken Fried Rice", "₹400"], ["Chicken Schezwan Rice", "₹450"],
                ["Prawns Fried Rice", "₹500"], ["Prawns Schezwan Rice", "₹550"],
                ["Chicken Biryani", "₹600"], ["Prawns Biryani", "₹650"], ["Fish Biryani", "₹650"],
              ].map(([name, price]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className="dot dn" /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ NOODLES & PASTA ═══ */}
          <section className="sec" id="noodles">
            <div className="sec-head">
              <p className="sec-tag">Noodles &amp; More</p>
              <h2 className="sec-title">Noodles &amp; <em>Pasta</em></h2>
            </div>
            <div className="legend">
              <div className="lg-item"><div className="dot dv" />Veg</div>
              <div className="lg-item"><div className="dot dn" />Non-Veg</div>
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Noodles</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Veg Noodles", "₹350", "v"], ["Veg Schezwan Noodles", "₹400", "v"],
                ["Chicken Noodles", "₹450", "n"], ["Chicken Schezwan Noodles", "₹500", "n"],
                ["Prawns Noodles", "₹550", "n"], ["Prawns Schezwan Noodles", "₹550", "n"],
              ].map(([name, price, type]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className={`dot ${type === "v" ? "dv" : "dn"}`} /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Pasta — Penne / Spaghetti</span><div className="cat-line" /></div>
            <div className="list">
              {[
                ["Pomodoro Pasta", "₹450", "v"], ["Arrabbiata Pasta", "₹450", "v"],
                ["Pollo Funghi Pasta", "₹550", "n"], ["Al Funghi Pasta", "₹480", "v"],
              ].map(([name, price, type]) => (
                <div className="row" key={name}>
                  <div className="row-l"><div className={`dot ${type === "v" ? "dv" : "dn"}`} /><span className="row-name">{name}</span></div>
                  <span className="row-price">{price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ COCKTAILS ═══ */}
          <section className="sec" id="cocktails">
            <div className="sec-head">
              <p className="sec-tag">Handcrafted</p>
              <h2 className="sec-title">Cock<em>tails</em></h2>
            </div>
            <div className="drink-list">
              {[
                ["Mojito", "White Rum, Mint, Lemon Juice, Brown Sugar, Soda, Ice"],
                ["Pina Colada", "Pineapple Juice, Lemon Juice, White Rum, Coconut Milk"],
                ["Screw Driver", "Lemon Juice, Orange Juice, Vodka"],
                ["Long Island Ice Tea", "Lemon Juice, Vodka, White Rum, Gin, Coke"],
                ["Sex on the Beach", "Vodka, Peach Schnapps, Orange Juice, Cranberry Juice"],
                ["Mai Tai", "Dark Rum, White Rum, Orange Juice, Pineapple Juice"],
                ["Strawberry Daiquiri", "White Rum, Strawberry, Orange Juice, Lemon Juice"],
                ["Blue Lagoon", "Vodka, Lemon Juice, Blue Curaçao, Orange Juice, Sprite"],
                ["Orange Blossom", "Gin, Orange Juice, Lemon Juice"],
                ["Planters Punch", "Dark Rum, Orange Juice, Pineapple Juice"],
                ["Coorioska", "Vodka, Lemon Juice, Lemon Slice, Brown Sugar"],
              ].map(([name, desc]) => (
                <div className="drink-card" key={name}>
                  <div className="drink-top"><span className="drink-name">{name}</span></div>
                  <p className="drink-desc">{desc}</p>
                </div>
              ))}
            </div>
            <p className="p-note">Prices on request · Ask your waiter</p>
          </section>

          {/* ═══ MOCKTAILS ═══ */}
          <section className="sec" id="mocktails">
            <div className="sec-head">
              <p className="sec-tag">Non-Alcoholic</p>
              <h2 className="sec-title">Mock<em>tails</em></h2>
            </div>
            <div className="drink-list">
              {[
                ["Virgin Mojito", "Lemon Juice, Mint, Brown Sugar, Black Salt, Sprite"],
                ["Virgin Pina Colada", "Pineapple Juice, Lemon Juice, Coconut Milk"],
                ["Cinderella", "Lemon Juice, Orange Juice, Pineapple Juice, Sugar Syrup, Soda"],
                ["Sunrise Mocktail", "Lemon Juice, Sugar Syrup, Orange Juice, Pineapple Juice"],
                ["Sunset Mocktail", "Watermelon Juice, Mint, Lemon Juice, Orange Juice, Ice, Sprite"],
                ["Red Bull Mocktail", "Mint, Lemon Juice, Sugar Syrup, Salt, Red Bull, Curaçao"],
                ["Cool Juice", "Strawberry Juice, Cranberry Juice, Apple Juice, Lemon Juice, Mint, Ice"],
                ["Blue Lagoon", "Blue Curaçao, Mint, Lemon Juice, Sugar Syrup, Ice, Soda"],
                ["Blue Berry", "Orange Juice, Lemon Juice, Sugar Syrup, Sprite, Soda"],
                ["Sunny Fizz", "Orange Juice, Lemon Juice, Ice"],
                ["Deep Blue", "Pineapple Juice, Mango Juice, Blue Curaçao"],
              ].map(([name, desc]) => (
                <div className="drink-card" key={name}>
                  <div className="drink-top"><span className="drink-name">{name}</span></div>
                  <p className="drink-desc">{desc}</p>
                </div>
              ))}
            </div>
            <p className="p-note">Prices on request · Ask your waiter</p>
          </section>

          {/* ═══ BAR ═══ */}
          <section className="sec" id="bar">
            <div className="sec-head">
              <p className="sec-tag">Bar &amp; Spirits</p>
              <h2 className="sec-title">Bar <em>Menu</em></h2>
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Beer — Bottle</span><div className="cat-line" /></div>
            <div className="bar-list">
              {[
                ["Corona", "₹200"], ["Hoegaarden", "₹200"], ["Budweiser", "₹200"], ["Carlsberg", "₹150"],
                ["Kingfisher Premium", "₹150"], ["Kingfisher Ultra", "₹150"], ["Bira", "₹150"],
                ["Goan Bear", "₹150"], ["Tuborg", "₹150"], ["Kingfisher Tin", "₹200"],
                ["Carlsberg Tin", "₹200"], ["Budweiser Tin", "₹200"], ["Brezers", "₹180"],
              ].map(([name, price]) => (
                <div className="bar-row" key={name}>
                  <span className="bar-name">{name}</span>
                  <span className="bar-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Scotch Whisky</span><div className="cat-line" /></div>
            <div className="bar-list">
              {[
                ["Black Dog", "₹300"], ["Something Special", "₹250"], ["100 Pipers", "₹250"],
                ["Black & White", "₹250"], ["Dewars", "₹250"], ["William Lawson's", "₹250"],
                ["Passport Scotch", "₹250"], ["VAT 69", "₹250"],
              ].map(([name, price]) => (
                <div className="bar-row" key={name}>
                  <span className="bar-name">{name}</span>
                  <span className="bar-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Whisky</span><div className="cat-line" /></div>
            <div className="bar-list">
              {[
                ["Rock Ford", "₹200"], ["Mackers Delight", "₹200"], ["Blenders Pride", "₹200"],
                ["Signature", "₹200"], ["Oaken Glow", "₹200"], ["Royal Challenge", "₹200"], ["O'Henry", "₹200"],
              ].map(([name, price]) => (
                <div className="bar-row" key={name}>
                  <span className="bar-name">{name}</span>
                  <span className="bar-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Vodka &amp; Others</span><div className="cat-line" /></div>
            <div className="bar-list">
              {[
                ["Smirnoff", "₹120"], ["Magic Moment", "₹100"], ["Romanov Vodka", "₹100"],
                ["Old Monk (Rum)", "₹100"], ["Wine", "₹300"], ["White Rum", "₹120"],
                ["Gin", "₹100"], ["Tequila", "₹200"], ["Fenny", "₹80"],
              ].map(([name, price]) => (
                <div className="bar-row" key={name}>
                  <span className="bar-name">{name}</span>
                  <span className="bar-price">{price}</span>
                </div>
              ))}
            </div>

            <div className="cat"><div className="cat-line" /><span className="cat-txt">Soft Drinks</span><div className="cat-line" /></div>
            <div className="bar-list">
              {[
                ["750 ML", "₹80"], ["Soda", "₹40"], ["Red Bull", "₹230"],
                ["Tin 330ML", "₹80"], ["Water Bottle 1L", "₹50"], ["Water Bottle 500ML", "₹30"],
              ].map(([name, price]) => (
                <div className="bar-row" key={name}>
                  <span className="bar-name">{name}</span>
                  <span className="bar-price">{price}</span>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="mfooter">
          <div className="f-gem"><div className="f-gem-d" /></div>
          <p className="footer-brand">Cola Goa</p>
          {/* <p>
            <strong>All prices inclusive of taxes</strong><br />
            Please inform your server of any allergies or dietary needs<br />
            Cola Beach, South Goa &nbsp;·&nbsp; Open Daily
          </p> */}
        </footer>

      </div>
    </>
  );
}