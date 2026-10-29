import { LightningElement, api } from "lwc";
import { detectBrandId } from "c/ecHtfBrandData";
import { getBrandTheme } from "c/ecHtfContentService";

export default class EcHtfBrandArt extends LightningElement {
  /** 'htf' | 'subway' | 'dunkin' — defaults to URL-detected brand */
  @api artType;
  /** Optional text label overlaid at bottom-left */
  @api label;

  _renderedType = null;

  renderedCallback() {
    // Rebuild the SVG whenever the effective brand/art type changes — this is
    // what lets the hero/section art update live when the experience is toggled.
    const type = this.artType || detectBrandId();
    if (type === this._renderedType) return;
    this._renderedType = type;
    this._renderArt(type);
  }

  async _renderArt(type) {
    const c = await getBrandTheme(type);
    // Bail out if the effective brand changed while the theme was loading.
    if (type !== (this.artType || detectBrandId())) return;
    const root = this.template.querySelector(".brand-art-root");
    if (root) root.innerHTML = this._buildSvg(type, c);
  }

  _buildSvg(type, c) {
    if (type === "subway") {
      return this._subwaySvg(c);
    } else if (type === "dunkin") {
      return this._dunkinSvg(c);
    }
    return this._htfSvg(c, type);
  }

  _htfSvg(c, type) {
    const hexPts = (cx, cy, r) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 30);
        pts.push(
          `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
        );
      }
      return pts.join(" ");
    };
    let dots = "";
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 8; col++) {
        dots += `<circle cx="${60 + col * 56}" cy="${60 + r * 56}" r="3.4"/>`;
      }
    }
    return `<svg class="brand-art-svg" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="520" fill="${c.brand}"/>
  <rect width="600" height="520" fill="url(#hexg${type})" opacity=".5"/>
  <polygon points="${hexPts(430, 150, 150)}" fill="${c.brand2}" opacity=".9"/>
  <polygon points="${hexPts(430, 150, 96)}" fill="${c.brand}" opacity="1"/>
  <polygon points="${hexPts(180, 380, 110)}" fill="#ffffff" opacity=".10"/>
  <g fill="#ffffff" opacity=".18">${dots}</g>
  <defs>
    <pattern id="hexg${type}" width="46" height="80" patternUnits="userSpaceOnUse">
      <path d="M23 0l23 13v26L23 52 0 39V13z" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.4"/>
    </pattern>
  </defs>
</svg>`;
  }

  _dunkinSvg(c) {
    const sprinkles = (() => {
      const cols = ["#ffffff", c.brand2, "#ffd200", "#ffffff"];
      const seed = [
        [90, 120, 20],
        [160, 90, -35],
        [120, 220, 60],
        [480, 400, -20],
        [520, 300, 40],
        [230, 460, 10],
        [60, 300, -50],
        [300, 60, 30],
        [540, 150, -15],
        [80, 210, 75]
      ];
      let o = '<g stroke-width="9" stroke-linecap="round">';
      seed.forEach((s, i) => {
        const a = (s[2] * Math.PI) / 180,
          L = 26;
        o += `<line x1="${(s[0] - Math.cos(a) * L).toFixed(1)}" y1="${(s[1] - Math.sin(a) * L).toFixed(1)}" x2="${(s[0] + Math.cos(a) * L).toFixed(1)}" y2="${(s[1] + Math.sin(a) * L).toFixed(1)}" stroke="${cols[i % cols.length]}" opacity=".9"/>`;
      });
      return o + "</g>";
    })();
    return `<svg class="brand-art-svg" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="520" fill="${c.brand}"/>
  <circle cx="410" cy="180" r="230" fill="${c.brand2}" opacity=".92"/>
  <circle cx="410" cy="180" r="150" fill="${c.brand}"/>
  <circle cx="410" cy="180" r="78" fill="#ffffff" opacity=".9"/>
  <circle cx="140" cy="420" r="120" fill="#ffffff" opacity=".12"/>
  ${sprinkles}
</svg>`;
  }

  _subwaySvg(c) {
    const seeds = [
      [70, 130, 20],
      [165, 405, -28],
      [515, 120, 40],
      [548, 360, -12],
      [300, 58, -22],
      [470, 452, 16]
    ];
    let scatter = '<g fill="#ffffff" opacity=".35">';
    seeds.forEach((s) => {
      scatter += `<ellipse cx="${s[0]}" cy="${s[1]}" rx="9" ry="4" transform="rotate(${s[2]} ${s[0]} ${s[1]})"/>`;
    });
    scatter += "</g>";
    // Sub sandwich
    const cx = 300,
      cy = 258,
      len = 470,
      h = 184,
      angle = -15;
    const hl = len / 2,
      bun = h * 0.42,
      gap = h * 0.16,
      topW = len * 0.92;
    const topY = (-h / 2).toFixed(1),
      botY = (h / 2 - bun).toFixed(1);
    const lr = (gap + h * 0.12).toFixed(1),
      span = (hl + h * 0.06).toFixed(1);
    const n = Math.max(
      4,
      Math.round((2 * (hl + h * 0.06)) / (parseFloat(lr) * 1.25))
    );
    let lettuce = '<g fill="#ffffff" opacity=".95">';
    for (let i = 0; i <= n; i++) {
      const x = (-parseFloat(span) + i * ((2 * parseFloat(span)) / n)).toFixed(
        1
      );
      lettuce += `<circle cx="${x}" cy="0" r="${lr}"/>`;
    }
    lettuce += "</g>";
    let seeds2 = '<g fill="' + c.brand2Deep + '" opacity=".6">';
    for (let j = 0; j < 8; j++) {
      const sx = (-topW * 0.34 + j * ((topW * 0.68) / 7)).toFixed(1);
      const sy = (parseFloat(topY) + bun * 0.45).toFixed(1);
      seeds2 += `<ellipse cx="${sx}" cy="${sy}" rx="5.5" ry="2.6" transform="rotate(${-22 + j * 7} ${sx} ${sy})"/>`;
    }
    seeds2 += "</g>";
    return `<svg class="brand-art-svg" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="520" fill="${c.brand}"/>
  <circle cx="115" cy="420" r="140" fill="#ffffff" opacity=".08"/>
  ${scatter}
  <g transform="translate(${cx} ${cy}) rotate(${angle})">
    <rect x="${(-hl).toFixed(1)}" y="${botY}" width="${len.toFixed(1)}" height="${bun.toFixed(1)}" rx="${(bun / 2).toFixed(1)}" fill="${c.brand2}"/>
    <rect x="${(-hl).toFixed(1)}" y="${(gap * 0.18).toFixed(1)}" width="${len.toFixed(1)}" height="${(h * 0.07).toFixed(1)}" fill="${c.brand2Deep}" opacity=".9"/>
    ${lettuce}
    <rect x="${(-(topW / 2)).toFixed(1)}" y="${topY}" width="${topW.toFixed(1)}" height="${bun.toFixed(1)}" rx="${(bun / 2).toFixed(1)}" fill="${c.brand2}"/>
    ${seeds2}
  </g>
</svg>`;
  }
}