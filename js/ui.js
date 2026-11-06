// Panel views (Upgrades, Career, Stats, Settings), toasts and banners.
import { UPGRADES, UPGRADE_ORDER, GROUNDS, COACHES, GEAR } from './config.js';
import { STARS, COUNTRIES } from './stars.js';
import * as E from './engine.js';
import { fmt, fmtTime, pct } from './format.js';
import { img } from './icons.js';
import { drawPortrait } from './sprites.js';
import { flagImg } from './flags.js';
import { thumbnail } from './backgrounds.js';
import { MILESTONE_EVERY } from './config.js';

const UP_ICON = { tempo: 'tempo', tech: 'tech', control: 'control', stamina: 'stamina', balls: 'balls' };
const oneIcon = it => (it.type === 'ball' ? 'ball' : it.type === 'boots' ? 'boots' : it.id[0] === 'c' ? 'coach' : 'ground');
export const starLook = st => ({ skin: st.skin, hair: st.hair, style: st.style, beard: st.beard, kit: st.kit, street: !!st.street, barefoot: !!st.street });

const $ = sel => document.querySelector(sel);

function enableArrowNavigation(root, selector, select) {
  root.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    const tabs = [...root.querySelectorAll(selector)];
    const current = tabs.indexOf(e.target.closest(selector));
    if (current < 0 || !tabs.length) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1
      : (current + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    tabs[next].focus();
    select(tabs[next]);
  });
}

export class UI {
  constructor(game) {
    this.g = game;              // { state, onBuy, onSettings, onExport, onImport, onReset }
    this.view = 'upgrades';
    this.sub = 'training';
    this.viewEl = $('#view');
    $('#tabs').querySelectorAll('button[data-view]').forEach(b => { b.tabIndex = b.dataset.view === this.view ? 0 : -1; });
    enableArrowNavigation($('#tabs'), 'button[data-view]', b => this.show(b.dataset.view));
    enableArrowNavigation(this.viewEl, 'button[data-sub]', b => {
      this.sub = b.dataset.sub;
      this.render();
      this.viewEl.querySelector(`[data-sub="${this.sub}"]`)?.focus();
    });
    $('#tabs').addEventListener('click', e => {
      const b = e.target.closest('button[data-view]');
      if (b) this.show(b.dataset.view);
    });
    this.viewEl.addEventListener('click', e => this.onClick(e));
    this.viewEl.addEventListener('input', e => this.onInput(e));
  }

  get s() { return this.g.state; }

  show(view) {
    this.view = view;
    document.querySelectorAll('#tabs button').forEach(b => {
      const active = b.dataset.view === view;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
      b.tabIndex = active ? 0 : -1;
    });
    this.viewEl.setAttribute('aria-labelledby', `tab-${view}`);
    this.render();
    if (view === 'career') {
      // Draw every player portrait into its canvas
      this.viewEl.querySelectorAll('canvas[data-star]').forEach(cv => drawPortrait(cv, starLook(STARS[cv.dataset.star])));
      const cur = this.viewEl.querySelector('li.current');
      if (cur) cur.scrollIntoView({ block: 'center' });
    }
  }

  render() {
    const v = this.view;
    if (v === 'upgrades') this.viewEl.innerHTML = this.upgradesHTML();
    else if (v === 'career') this.viewEl.innerHTML = this.careerHTML();
    else if (v === 'stats') this.viewEl.innerHTML = this.statsHTML();
    else this.viewEl.innerHTML = this.settingsHTML();
    this.refresh();
  }

  // Called a few times per second: updates numbers without rebuilding.
  refresh() {
    if (this.view === 'upgrades') this.refreshUpgrades();
    else if (this.view === 'stats') this.viewEl.querySelector('.kv').innerHTML = this.statsRows();
  }

  // ---------- Upgrades ----------
  upgradesHTML() {
    const subs = [['training', 'Training'], ['gear', 'Gear'], ['coaches', 'Coaches'], ['grounds', 'Grounds']];
    let h = `<div class="subtabs" role="tablist" aria-label="Upgrade categories">${subs.map(([k, n]) =>
      `<button id="subtab-${k}" role="tab" tabindex="${this.sub === k ? 0 : -1}" aria-controls="upgrade-category-content" aria-selected="${this.sub === k}" data-sub="${k}" class="${this.sub === k ? 'active' : ''}">${n}<span class="dot hidden" data-dot="${k}"></span></button>`).join('')}</div>`;
    let body = '';
    if (this.sub === 'training') {
      const amt = this.s.settings.buyAmount;
      body += `<div class="shop-heading"><div><span class="eyebrow">TRAINING PLAN</span><h3>Build your game</h3><p>Best return for your selected buy amount is highlighted.</p></div><div class="shop-rate"><strong data-shop-rate></strong><span>earning rate</span></div></div>`;
      body += `<div class="amount"><span>BUY AMOUNT</span>${[1, 10, 100, 'max'].map(a =>
        `<button data-amount="${a}" class="${amt === a ? 'active' : ''}">${a === 'max' ? 'MAX' : 'x' + a}</button>`).join('')}</div>`;
      body += UPGRADE_ORDER.map(id => `
        <div class="up" data-up="${id}">
          <div class="icon-tile">${img(UP_ICON[id], 40)}<span class="lvl-badge"></span></div>
          <h4>${UPGRADES[id].name}<span class="best-pick hidden">BEST VALUE</span></h4>
          <div class="eff"></div>
          <div class="mile">${['tempo', 'tech'].includes(id) ? '<span class="mtext"></span><div class="mbar"><div></div></div>' : `<span>${UPGRADES[id].desc}</span>`}</div>
          <button class="buy" data-buy="${id}"></button>
        </div>`).join('');
    } else {
      const list = this.sub === 'gear' ? GEAR : this.sub === 'coaches' ? COACHES : GROUNDS;
      body += list.map(it => `
        <div class="up" data-one="${it.id}">
          <div class="icon-tile">${img(oneIcon(it), 40)}</div>
          <h4>${it.name}</h4>
          <div class="eff"><b>x${it.mult}</b> all Training Points</div>
          <div class="mile"><span>${it.desc}</span></div>
          <button class="buy" data-buyone="${it.id}"></button>
        </div>`).join('');
    }
    return h + `<div id="upgrade-category-content" role="tabpanel" aria-labelledby="subtab-${this.sub}" tabindex="0">${body}</div>`;
  }

  amountFor(id) {
    const a = this.s.settings.buyAmount;
    if (a === 'max') return Math.max(1, E.maxAffordable(id, this.s.levels[id], this.s.tp));
    return a;
  }

  effectText(id, n) {
    const s = this.s;
    const val = () => {
      switch (id) {
        case 'tempo': return fmt(E.passRatePerBall(s), 2) + '/s per ball';
        case 'tech': return fmt(E.techBase(s)) + ' TP per pass';
        case 'control': return pct(E.successRate(s));
        case 'stamina': return 'max streak ' + fmt(E.streakCap(s));
        case 'balls': return fmt(E.ballCount(s)) + (E.ballCount(s) === 1 ? ' ball' : ' balls');
      }
    };
    const now = val();
    s.levels[id] += n;
    const next = val();
    s.levels[id] -= n;
    return `${now} &rarr; <b>${next}</b>`;
  }

  refreshUpgrades() {
    const s = this.s;
    const coin = img('coin', 14, 'c');
    const baseline = this.g.tps();
    const candidates = UPGRADE_ORDER.map(id => {
      const n = this.amountFor(id), cost = E.upgradeCost(id, s.levels[id], n);
      const old = s.levels[id];
      s.levels[id] += n;
      const gain = this.g.tps() - baseline;
      s.levels[id] = old;
      return { id, score: Number.isFinite(cost) && cost > 0 ? gain / cost : 0 };
    }).filter(x => x.score > 0 && Number.isFinite(x.score)).sort((a, b) => b.score - a.score);
    const bestId = candidates[0]?.id;
    const rate = this.viewEl.querySelector('[data-shop-rate]');
    if (rate) rate.textContent = '+' + fmt(baseline, 1) + '/s';
    const costBtn = (cost, n, can, progress) => `${n > 1 ? 'BUY x' + n : 'BUY'}<span class="cost">${coin}${fmt(cost)}</span><span class="buy-progress">${can ? 'READY' : fmt(progress * 100, 0) + '% FUNDED'}</span>`;
    this.viewEl.querySelectorAll('[data-up]').forEach(el => {
      const id = el.dataset.up, n = this.amountFor(id), L = s.levels[id];
      const cost = E.upgradeCost(id, L, n), can = cost <= s.tp;
      el.classList.toggle('recommended', id === bestId);
      el.querySelector('.best-pick').classList.toggle('hidden', id !== bestId);
      el.querySelector('.lvl-badge').textContent = 'LV ' + L;
      el.querySelector('.eff').innerHTML = this.effectText(id, n);
      const mt = el.querySelector('.mtext');
      if (mt) {
        const next = (Math.floor(L / MILESTONE_EVERY) + 1) * MILESTONE_EVERY;
        mt.textContent = `x2 at LV ${next}`;
        el.querySelector('.mbar div').style.width = ((L % MILESTONE_EVERY) / MILESTONE_EVERY * 100) + '%';
      }
      const btn = el.querySelector('.buy');
      const html = costBtn(cost, n, can, Math.min(1, s.tp / cost));
      if (btn.dataset.h !== html) { btn.innerHTML = html; btn.dataset.h = html; }
      btn.disabled = !can;
      btn.setAttribute('aria-label', `${n > 1 ? `Buy ${n} levels of` : 'Buy'} ${UPGRADES[id].name} for ${fmt(cost)} Training Points. ${can ? 'Ready to buy.' : `${fmt(Math.min(100, s.tp / cost * 100), 0)} percent funded.`}`);
      btn.style.setProperty('--p', Math.min(100, s.tp / cost * 100) + '%');
      el.classList.toggle('can', can);
    });
    this.viewEl.querySelectorAll('[data-one]').forEach(el => {
      const it = E.findOneOff(el.dataset.one);
      const btn = el.querySelector('.buy');
      const owned = !!s.owned[it.id], unlocked = E.isUnlocked(s, it);
      const cost = E.oneOffCost(it), can = !owned && unlocked && cost <= s.tp;
      el.classList.toggle('owned', owned);
      el.classList.toggle('locked', !unlocked && !owned);
      el.classList.toggle('can', can);
      const html = owned ? 'OWNED' : !unlocked ? `LOCKED<span class="cost">RATING ${it.rating}</span>` : costBtn(cost, 1, can, Math.min(1, s.tp / cost));
      if (btn.dataset.h !== html) { btn.innerHTML = html; btn.dataset.h = html; }
      btn.disabled = !can;
      btn.setAttribute('aria-label', owned ? `${it.name}, owned.` : !unlocked ? `${it.name}, unlocked at rating ${it.rating}.` : `Buy ${it.name} for ${fmt(cost)} Training Points. ${can ? 'Ready to buy.' : `${fmt(Math.min(100, s.tp / cost * 100), 0)} percent funded.`}`);
      btn.style.setProperty('--p', owned || !unlocked ? '0%' : Math.min(100, s.tp / cost * 100) + '%');
    });
    // Green dot on sub-tabs that have something affordable
    const groups = { training: null, gear: GEAR, coaches: COACHES, grounds: GROUNDS };
    for (const [k, list] of Object.entries(groups)) {
      const dot = this.viewEl.querySelector(`[data-dot="${k}"]`);
      if (!dot) continue;
      const any = list
        ? list.some(it => !s.owned[it.id] && E.isUnlocked(s, it) && E.oneOffCost(it) <= s.tp)
        : UPGRADE_ORDER.some(id => E.upgradeCost(id, s.levels[id]) <= s.tp);
      dot.classList.toggle('hidden', !any);
    }
  }

  // Short pop animation on a card after buying
  flash(id) {
    const el = this.viewEl.querySelector(`[data-up="${id}"], [data-one="${id}"]`);
    if (!el) return;
    el.classList.remove('bought'); void el.offsetWidth; el.classList.add('bought');
  }

  // ---------- Career ----------
  careerHTML() {
    const s = this.s, r = s.highestRating, cur = E.currentStar(r);
    let h = `<div class="section-title">TRAINING GROUNDS</div><div class="grounds">`;
    for (const g of GROUNDS) {
      const owned = !!s.owned[g.id], open = E.isUnlocked(s, g);
      const cls = owned ? 'owned' : open ? '' : 'locked';
      const label = owned ? 'Owned' : open ? 'Available' : 'Rating ' + g.rating;
      h += `<div class="gcard ${cls}"><img src="${thumbnail(g.id)}" alt="${g.name}"><div>${g.name}<small>${label}</small></div></div>`;
    }
    h += `</div><div class="section-title">PLAYER LADDER</div><ul class="ladder">`;
    STARS.forEach((st, i) => {
      const state = st === cur ? 'current' : st.rating < cur.rating ? 'done' : 'locked';
      const label = state === 'current' ? 'YOU' : state === 'done' ? 'Played' : 'Rating ' + st.rating;
      h += `<li class="${state}"><span class="r">${st.rating}</span><canvas data-star="${i}" width="40" height="40"></canvas>
        <span class="n">${state === 'locked' && st.rating === 99 ? '???' : st.name}<small><span class="num">#${st.num}</span> ${flagImg(st.nation, 1)} ${COUNTRIES[st.nation]} &middot; ${st.street ? 'Mumbai streets' : st.from}</small></span>
        <span class="s">${label}</span></li>`;
    });
    h += r >= 99
      ? `<li class="current"><span class="r">${r}</span><span></span><span class="n">Legend mode<small>${r - 99} legend stars</small></span><span class="s">Endless</span></li>`
      : `<li class="locked"><span class="r">100+</span><span></span><span class="n">Legend mode<small>Keep improving forever</small></span><span class="s">Endless</span></li>`;
    return h + '</ul>';
  }

  // ---------- Stats ----------
  statsHTML() { return `<div class="section-title">STATISTICS</div><div class="kv"></div>`; }

  statsRows() {
    const s = this.s;
    const rows = [
      ['Current player', E.currentStar(s.highestRating).name],
      ['Rating', s.highestRating],
      ['Successful passes', fmt(s.passes)],
      ['Missed passes', fmt(s.misses)],
      ['Best streak', fmt(s.bestStreak)],
      ['Lifetime Training Points', fmt(s.xp)],
      ['TP per second', fmt(this.g.tps(), 1)],
      ['Upgrades bought', fmt(s.upgradesBought)],
      ['Training time', fmtTime(s.playTime)],
      ['Career started', new Date(s.startedAt).toLocaleDateString('en-GB')],
    ];
    return rows.map(([k, v]) => `<div>${k}</div><div>${v}</div>`).join('');
  }

  // ---------- Settings ----------
  settingsHTML() {
    const st = this.s.settings;
    const tog = (key, label) => `<div class="setting"><span>${label}</span>
      <button class="toggle ${st[key] ? 'on' : ''}" data-toggle="${key}">${st[key] ? 'ON' : 'OFF'}</button></div>`;
    return `<div class="section-title">SETTINGS</div>
      ${tog('sfx', 'Sound effects')}
      ${tog('music', 'Music')}
      <div class="setting"><span>Volume</span><input type="range" min="0" max="1" step="0.05" value="${st.volume}" data-volume></div>
      <div class="setting"><span>Number format</span>
        <button class="toggle on" data-notation>${st.notation === 'sci' ? '1.23e6' : '1.23M'}</button></div>
      ${tog('reducedMotion', 'Reduce motion')}
      <div class="section-title">SAVE</div>
      <div class="muted" style="font-size:13px">The game saves automatically every few seconds in this browser.</div>
      <textarea id="save-text" placeholder="Export creates a save code. Paste a code here and press Import."></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" data-act="export">Export</button>
        <button class="btn" data-act="import">Import</button>
        <button class="btn danger" data-act="reset">Delete save</button>
      </div>
      <div class="about">BALLKING is an unofficial fan game made for fun. It is not affiliated with,
        endorsed by or connected to any player, club, league or federation. Player names are only
        used as career milestones; all graphics are generic pixel figures.<br><br>
        Training only runs while this tab is open and visible. No offline progress.</div>`;
  }

  // ---------- Events ----------
  onClick(e) {
    const t = e.target.closest('button');
    if (!t) return;
    const s = this.s;
    if (t.dataset.sub) { this.sub = t.dataset.sub; this.render(); return; }
    if (t.dataset.amount) {
      const a = t.dataset.amount;
      s.settings.buyAmount = a === 'max' ? 'max' : Number(a);
      this.render(); return;
    }
    if (t.dataset.buy) { this.g.onBuy(t.dataset.buy, this.amountFor(t.dataset.buy)); return; }
    if (t.dataset.buyone) { this.g.onBuyOne(t.dataset.buyone); return; }
    if (t.dataset.toggle) {
      s.settings[t.dataset.toggle] = !s.settings[t.dataset.toggle];
      this.g.onSettings(); this.render(); return;
    }
    if (t.hasAttribute('data-notation')) {
      s.settings.notation = s.settings.notation === 'sci' ? 'short' : 'sci';
      this.g.onSettings(); this.render(); return;
    }
    const act = t.dataset.act;
    const box = $('#save-text');
    if (act === 'export') { box.value = this.g.onExport(); box.select(); }
    if (act === 'import') {
      if (!box.value.trim()) return toast('Paste a save code first.');
      if (!this.g.onImport(box.value)) toast('That save code did not work.');
    }
    // Two-step delete (browser confirm dialogs are not available everywhere)
    if (act === 'reset') {
      if (t.dataset.armed) { this.g.onReset(); return; }
      t.dataset.armed = '1';
      t.textContent = 'Click again to delete';
      setTimeout(() => { if (t.isConnected) { delete t.dataset.armed; t.textContent = 'Delete save'; } }, 4000);
    }
  }

  onInput(e) {
    if (e.target.hasAttribute('data-volume')) {
      this.s.settings.volume = Number(e.target.value);
      this.g.onSettings();
    }
  }
}

export function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = text;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 4000);
  const all = document.querySelectorAll('.toast');
  if (all.length > 4) all[0].remove();
}

let bannerTimer = null;
export function banner(top, name, sub) {
  const el = $('#banner');
  el.innerHTML = `<div class="b-top">${top}</div><div class="b-name">${name}</div><div class="b-sub">${sub}</div>`;
  el.classList.remove('hidden');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => el.classList.add('hidden'), 3800);
}
