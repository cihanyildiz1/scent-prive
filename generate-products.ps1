$products = @(
  @{
    num = "01"; name = "Doft 01"; tagline = "En doft som märks."
    price6 = "129"; price12 = "199"
    img = "collection.png"
    desc = "En doft som lämnar avtryck. Varje flaska är noggrant framtagen för att ge dig en djup, långvarig upplevelse du faktiskt märker av."
    notes_top = "Bergamott, Svartpeppar"; notes_heart = "Ros, Cederträ"; notes_base = "Mysk, Amber"
  },
  @{
    num = "02"; name = "Doft 02"; tagline = "Diskret, men kraftfull."
    price6 = "129"; price12 = "199"
    img = "hero-mockup.png"
    desc = "En doft som talar för sig självt. Skapad för dig som väljer kvalitet framför quantitet."
    notes_top = "Cedarwood, Citrus"; notes_heart = "Sandel, Patchouli"; notes_base = "Oud, Mysk"
  },
  @{
    num = "03"; name = "Doft 03"; tagline = "Inte för alla."
    price6 = "129"; price12 = "199"
    img = "lifestyle.png"
    desc = "Skapad för dem som vet vad de vill ha. En unik komposition med bestående intryck."
    notes_top = "Jasmin, Iris"; notes_heart = "Rosenved, Amber"; notes_base = "Vanilj, Mysk"
  },
  @{
    num = "04"; name = "Doft 04"; tagline = "En doft som stannar kvar."
    price6 = "129"; price12 = "199"
    img = "collection.png"
    desc = "En djup och varm doft som tar med dig på en resa. Perfekt för dem som söker något bortom det vanliga."
    notes_top = "Kardemumma, Peppar"; notes_heart = "Amber, Leather"; notes_base = "Bensoin, Mysk"
  },
  @{
    num = "05"; name = "Doft 05"; tagline = "Rätt närvarokraft."
    price6 = "129"; price12 = "199"
    img = "hero-mockup.png"
    desc = "Närvaro utan att ta plats. En balanserad doft som passar alla tillfällen – från kontoret till kvällen."
    notes_top = "Citrus, Gurkmeja"; notes_heart = "Sandel, Vetiver"; notes_base = "Oud, Mysk"
  }
)

$template = @'
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{NAME}} — Scent Privé</title>
  <meta name="description" content="{{TAGLINE}} Köp {{NAME}} från Scent Privé – exklusiva doftoljor i roll-on format." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="page-product">

  <nav id="navbar" class="scrolled">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo-text">SCENT PRIVÉ</a>
      <div class="nav-links">
        <a href="index.html#collection" class="nav-link">Dofter</a>
        <button class="nav-cart-link" id="nav-cart" aria-label="Öppna varukorg">Varukorg (<span id="cart-count">0</span>)</button>
      </div>
    </div>
  </nav>

  <main id="product-detail">
    <div class="pd-inner">

      <div class="pd-gallery reveal">
        <div class="pd-img-main">
          <img src="assets/images/{{IMG}}" alt="{{NAME}}" />
        </div>
      </div>

      <div class="pd-info reveal" style="transition-delay: 0.1s">
        <nav class="pd-breadcrumbs">
          <a href="index.html">Hem</a> / <a href="index.html#collection">Dofter</a> / {{NAME}}
        </nav>

        <h1 class="pd-title">{{NAME}}</h1>
        <p class="pd-tagline">{{TAGLINE}}</p>
        <p class="pd-price" id="pd-price-display"><strong>{{PRICE6}} kr</strong></p>

        <div class="pd-desc">
          <p>{{DESC}}</p>
        </div>

        <div class="pd-form">
          <label class="pd-label">Välj storlek</label>
          <div class="pd-radio-group">
            <label class="pd-radio">
              <input type="radio" name="size" value="6ml" data-price="{{PRICE6}}" checked />
              <span>6 ml – {{PRICE6}} kr</span>
            </label>
            <label class="pd-radio">
              <input type="radio" name="size" value="12ml" data-price="{{PRICE12}}" />
              <span>12 ml – {{PRICE12}} kr</span>
            </label>
          </div>

          <label class="pd-label" style="margin-top:24px">Antal</label>
          <div class="pd-qty-group">
            <button type="button" class="qty-btn" id="qty-minus" aria-label="Minska">−</button>
            <span id="qty-display">1</span>
            <button type="button" class="qty-btn" id="qty-plus" aria-label="Öka">+</button>
          </div>

          <button type="button" class="btn-primary pd-btn" id="add-to-cart-btn"
            data-product-name="{{NAME}}"
            data-product-price="{{PRICE6}}">
            Lägg i varukorg
          </button>
        </div>

        <div class="pd-accordions">
          <div class="pd-accordion">
            <h4 class="pd-accordion-title" role="button">Doftnoter</h4>
            <div class="pd-accordion-content">
              <p><strong>Topp:</strong> {{NOTES_TOP}}<br>
                 <strong>Hjärta:</strong> {{NOTES_HEART}}<br>
                 <strong>Bas:</strong> {{NOTES_BASE}}</p>
            </div>
          </div>
          <div class="pd-accordion">
            <h4 class="pd-accordion-title" role="button">Användning</h4>
            <div class="pd-accordion-content">
              <p>Applicera på handleder, hals eller nyckelben. Gnugga inte – låt kroppsvärmen aktivera doften.</p>
            </div>
          </div>
          <div class="pd-accordion">
            <h4 class="pd-accordion-title" role="button">Leverans & Retur</h4>
            <div class="pd-accordion-content">
              <p>Fri frakt över 399 kr. Leverans 1–3 vardagar. 14 dagars öppet köp på oöppnad förpackning.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>

  <footer id="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <img src="assets/images/logo.png" alt="Scent Privé" class="footer-logo" />
        <p class="footer-tagline">Exklusiva doftoljor som märks.</p>
      </div>
      <div class="footer-grid">
        <div class="footer-col">
          <strong>Kundtjänst</strong>
          <a href="kontakt.html">Kontakt</a>
          <a href="frakt.html">Frakt &amp; Leverans</a>
          <a href="retur.html">Retur</a>
        </div>
        <div class="footer-col">
          <strong>Information</strong>
          <a href="kopvillkor.html">Köpvillkor</a>
          <a href="integritetspolicy.html">Integritetspolicy</a>
          <a href="https://www.instagram.com/scentprive.se" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <p class="footer-copy">© 2026 Scent Privé.</p>
    </div>
  </footer>

  <div id="cart-overlay" class="cart-overlay" hidden></div>
  <aside id="cart-panel" class="cart-panel" aria-hidden="true">
    <div class="cart-panel-header">
      <h3>Varukorg</h3>
      <button id="cart-close" aria-label="Stäng varukorg">✕</button>
    </div>
    <div id="cart-items" class="cart-items"></div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Totalt</span>
        <span id="cart-total-price">0 kr</span>
      </div>
      <button class="btn-primary" style="width:100%">Gå till kassan</button>
    </div>
  </aside>

  <script src="scripts.js"></script>
</body>
</html>
'@

foreach ($p in $products) {
  $html = $template
  $html = $html -replace '{{NAME}}',       $p.name
  $html = $html -replace '{{TAGLINE}}',    $p.tagline
  $html = $html -replace '{{PRICE6}}',     $p.price6
  $html = $html -replace '{{PRICE12}}',    $p.price12
  $html = $html -replace '{{IMG}}',        $p.img
  $html = $html -replace '{{DESC}}',       $p.desc
  $html = $html -replace '{{NOTES_TOP}}',  $p.notes_top
  $html = $html -replace '{{NOTES_HEART}}',$p.notes_heart
  $html = $html -replace '{{NOTES_BASE}}', $p.notes_base

  $filename = "product-$($p.num).html"
  $html | Set-Content -Path "C:\Users\cihan\.gemini\antigravity\scratch\scent-prive\$filename" -Encoding UTF8
  Write-Host "Created: $filename"
}
Write-Host "Done."
