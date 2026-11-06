// Panel views (Upgrades, Career, Stats, Settings), toasts and banners.
import { UPGRADES, UPGRADE_ORDER, GROUNDS, COACHES, GEAR } from './config.js';
import { STARS, COUNTRIES } from './stars.js';
import * as E from './engine.js';
import { fmt, fmtTime, pct } from './format.js';

const $ = sel => document.querySelector(sel);

export class UI {
  constructor(game) {
    this.g = game;              // { state, onBuy, onSettings, onExport, onImport, onReset }
    this.view = 'upgrades';
    this.sub = 'training';
    this.viewEl = $('#view');
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
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    this.render();
    if (view === 'career') {
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
    let h = `<div class="subtabs">${subs.map(([k, n]) =>
      `<button data-sub="${k}" class="${this.sub === k ? 'active' : ''}">${n}</button>`).join('')}</div>`;
    if (this.sub === 'training') {
      const amt = this.s.settings.buyAmount;
      h += `<div class="amount">BUY ${[1, 10, 100, 'max'].map(a =>
        `<button data-amount="${a}" class="${amt === a ? 'active' : ''}">${a === 'max' ? 'MAX' : 'x' + a}</button>`).join('')}</div>`;
      h += UPGRADE_ORDER.map(id => `
        <div class="up" data-up="${id}">
          <div><h4>${UPGRADES[id].name}<span class="lvl"></span></h4></div>
          <div class="desc">${UPGRADES[id].desc}</div>
          <div class="eff"></div>
          <div class="afford"><div></div></div>
          <button class="buy" data-buy="${id}"></button>
        </div>`).join('');
    } else {
      const list = this.sub === 'gear' ? GEAR : this.sub === 'coaches' ? COACHES : GROUNDS;
      h += list.map(it => `
        <div class="up" data-one="${it.id}">
          <div><h4>${it.name}</h4></div>
          <div class="desc">${it.desc}</div>
          <div class="eff">x${it.mult} all Training Points</div>
          <div class="afford"><div></div></div>
          <button class="buy" data-buyone="${it.id}"></button>
        </div>`).join('');
    }
    return h;
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
    this.viewEl.querySelectorAll('[data-up]').forEach(el => {
      const id = el.dataset.up, n = this.amountFor(id);
      const cost = E.upgradeCost(id, s.levels[id], n);
      el.querySelector('.lvl').textContent = 'Lv ' + s.levels[id];
      el.querySelector('.eff').innerHTML = this.effectText(id, n);
      const btn = el.querySelector('.buy');
      btn.innerHTML = `${n > 1 ? 'x' + n + '<br>' : ''}${fmt(cost)} TP`;
      btn.disabled = cost > s.tp;
      el.querySelector('.afford div').style.width = Math.min(100, s.tp / cost * 100) + '%';
    });
    this.viewEl.querySelectorAll('[data-one]').forEach(el => {
      const it = E.findOneOff(el.dataset.one);
      const btn = el.querySelector('.buy');
      const owned = !!s.owned[it.id], unlocked = E.isUnlocked(s, it);
      el.classList.toggle('owned', owned);
      el.classList.toggle('locked', !unlocked && !owned);
      const cost = E.oneOffCost(it);
      if (owned) { btn.innerHTML = 'OWNED'; btn.disabled = true; }
      else if (!unlocked) { btn.innerHTML = `RATING<br>${it.rating}`; btn.disabled = true; }
      else { btn.innerHTML = `${fmt(cost)} TP`; btn.disabled = cost > s.tp; }
      el.querySelector('.afford div').style.width = owned ? '100%' : unlocked ? Math.min(100, s.tp / cost * 100) + '%' : '0%';
    });
  }

  // ---------- Career ----------
  careerHTML() {
    const s = this.s, r = s.highestRating, cur = E.currentStar(r);
    let h = `<div class="section-title">PLAYER LADDER</div><ul class="ladder">`;
    for (const st of STARS) {
      const state = st === cur ? 'current' : st.rating < cur.rating ? 'done' : 'locked';
      const label = state === 'current' ? 'YOU' : state === 'done' ? 'Played' : 'Rating ' + st.rating;
      h += `<li class="${state}"><span class="r">${st.rating}</span>
        <span class="n">${st.name}<small>${st.origin || COUNTRIES[st.nation]}</small></span>
        <span class="s">${label}</span></li>`;
    }
    if (r >= 99) {
      h += `<li class="current"><span class="r">${r}</span><span class="n">Legend mode<small>${r - 99} legend stars</small></span><span class="s">Endless</span></li>`;
    } else {
      h += `<li class="locked"><span class="r">100+</span><span class="n">Legend mode<small>Keep improving forever</small></span><span class="s">Endless</span></li>`;
    }
    h += `</ul><div class="section-title">TRAINING GROUNDS</div><ul class="ladder">`;
    for (const g of GROUNDS) {
      const state = s.owned[g.id] ? 'done' : E.isUnlocked(s, g) ? 'current' : 'locked';
      const label = s.owned[g.id] ? 'Owned' : E.isUnlocked(s, g) ? 'Available' : 'Rating ' + g.rating;
      h += `<li class="${state === 'current' ? '' : state}"><span class="r">${g.rating}</span><span class="n">${g.name}<small>${g.desc}</small></span><span class="s">${label}</span></li>`;
    }
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
    if (act === 'reset' && confirm('Delete your whole career? This cannot be undone.')) this.g.onReset();
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
