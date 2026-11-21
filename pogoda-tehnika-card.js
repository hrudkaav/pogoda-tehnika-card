/* Погода · ТЕХНіКА | MIT
 * Install as a JavaScript module: /local/pogoda-tehnika-card.js
 * type: custom:pogoda-tehnika-card
 * entity: weather.forecast_home
 * No external dependencies. All dates and times use Europe/Kyiv.
 */
(() => {
  'use strict';
  const VERSION = "0.3.0";
  const TAG = 'pogoda-tehnika-card';
  const FRAME_KEY = 'tehnika-cards:frame';
  const FRAME_EVENT = 'tehnika-cards-frame';
  const PREF_EVENT = 'tehnika-weather-appearance';
  const TZ = 'Europe/Kyiv';
  const HOUR = 3600000;
  const DEFAULTS = { palette: 'olive', mode: 'auto', icon_style: 'flat', hours: 6, days: 5,
    show_hourly: true, show_daily: true, show_precipitation: true };
  const PALETTES = {
    olive: {
      frame: '#2a2d30', rim: '#4c5054',
      dark: { sf:'#1a1c1e', popbg:'#24272a', edge:'#383c40', ink:'#f2f3ef', quiet:'#aeb3ad', fc:'#111315', off:'#2a2e30', ring:'#464b4f' },
      light: { sf:'#e3e6e2', popbg:'#f1f3f0', edge:'#b7bcb4', ink:'#1b1e1a', quiet:'#454b43', fc:'#d5d9d3', off:'#cfd3cc', ring:'rgba(0,0,0,.22)' }
    },
    graphite: {
      frame: '#26292c', rim: '#4d5359',
      dark: { sf:'#1d2124', popbg:'#272c30', edge:'#3a4045', ink:'#f1f3f4', quiet:'#a8aeb3', fc:'#14171a', off:'#2c3236', ring:'#4a5156' },
      light: { sf:'#e4e7e9', popbg:'#f2f4f5', edge:'#b9bfc3', ink:'#15181a', quiet:'#444a4f', fc:'#d6dadd', off:'#d0d5d8', ring:'rgba(0,0,0,.22)' }
    }
  };
  // Embedded filled Material Design paths; never fetched at runtime.
  const PATHS = {
    settings: 'M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81A.488.488 0 0 0 13.92 2h-3.84c-.24 0-.44.17-.48.41l-.36 2.94c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.72 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.31-.09.64-.09.94s.02.63.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.94c.04.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.94c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z',
    close: 'M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.41 4.3 19.71 2.89 18.3 9.18 12 2.89 5.71 4.3 4.29 10.59 10.59 16.88 4.29z',
    expand: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z',
    sunny: 'M6.76 4.84 4.96 3.05 3.55 4.46l1.79 1.8 1.42-1.42zM1 10.5h3v2H1v-2zm10-10h2v3h-2v-3zm8.04 2.55-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM20 10.5h3v2h-3v-2zm-8-5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-1 14h2v3h-2v-3zm6.24-1.34 1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM3.55 18.54l1.41 1.41 1.8-1.79-1.42-1.42-1.79 1.8z',
    cloudy: 'M19.35 10.04A7.49 7.49 0 0 0 12 4a7.48 7.48 0 0 0-6.65 4.04A6 6 0 0 0 6 20h13a5 5 0 0 0 .35-9.96z',
    night: 'M9.37 5.51A7 7 0 0 0 18.49 14.63 7.01 7.01 0 0 1 5 12a7.01 7.01 0 0 1 4.37-6.49M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-7.54-7.54A9.02 9.02 0 0 0 12 3z',
    water: 'M12 2.69 6.34 8.34A8 8 0 1 0 17.66 8.34L12 2.69z',
    wind: 'M4 10h12a4 4 0 1 0-4-4h2a2 2 0 1 1 2 2H4v2zm-2 4h17a2 2 0 1 1-2 2h-2a4 4 0 1 0 4-4H2v2zm2 4h6v2H4v-2z',
    snow: 'M20 16.6 15.4 14l1.4-.8 3.4.9.5-1.9-2.3-.6.6-2.3-1.9-.5-.9 3.4-1.4.8V9.7l2.5-2.5-1.4-1.4L14 7.4V2h-2v5.4l-1.9-1.9-1.4 1.4L11.2 9.4v3.3l-1.4-.8-.9-3.4-1.9.5.6 2.3-2.3.6.5 1.9 3.4-.9 1.4.8L6 16.3l1 1.7 4.2-2.4v1.6l-2.5 2.5 1.4 1.4L12 19.2V22h2v-2.8l1.9 1.9 1.4-1.4-2.5-2.5v-1.6L19 18l1-1.4z',
    lightning: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66L13 3h1l-1 7h3.5c.5 0 .57.33.38.66L11 21z',
    fog: 'M3 15h18v2H3v-2zm2 4h14v2H5v-2zM19 8a5 5 0 0 0-9.7-1.7A4 4 0 0 0 5 13h14a2.5 2.5 0 0 0 0-5z',
    alert: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    unknown: 'M11 18h2v2h-2v-2zm1-16a7 7 0 0 0-7 7h2a5 5 0 1 1 8.5 3.57C14.04 14 11 14.5 11 17h2c0-1.5 2.27-2.36 3.91-4A7 7 0 0 0 12 2z'
  };
  const CONDITIONS = { sunny:'Сонячно', 'clear-night':'Ясна ніч', partlycloudy:'Мінлива хмарність', cloudy:'Хмарно', rainy:'Дощ', pouring:'Злива', snowy:'Сніг', 'snowy-rainy':'Мокрий сніг', hail:'Град', lightning:'Гроза', 'lightning-rainy':'Гроза з дощем', fog:'Туман', windy:'Вітряно', 'windy-variant':'Хмарно й вітряно', exceptional:'Незвичайні погодні умови', unknown:'Немає даних', unavailable:'Дані недоступні' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const number = value => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) ? Number(value) : null;
  const fmt = (value, decimals = 0) => number(value) === null ? '—' : new Intl.NumberFormat('uk-UA', { maximumFractionDigits:decimals }).format(Number(value));
  const signed = value => number(value) === null ? '—' : `${Number(value) > 0 ? '+' : ''}${fmt(value)}`;
  const dateFmt = (date, options) => new Intl.DateTimeFormat('uk-UA', { timeZone:TZ, ...options }).format(new Date(date));
  const dayKey = date => new Intl.DateTimeFormat('en-CA', { timeZone:TZ, year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(date));
  const localHour = date => Number(dateFmt(date, { hour:'2-digit', hourCycle:'h23' }));
  const percent = value => number(value) === null ? null : Math.min(100, Math.max(0, Number(value)));
  const readCache = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const writeCache = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
  const parse = text => { try { return JSON.parse(text); } catch { return null; } };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${PATHS[name] || PATHS.unknown}"/></svg>`;
  // All three weather families are embedded SVG. No raster files or remote assets.
  let weatherIconSequence = 0;
  function weatherIcon(condition, cls = '', style = 'flat') {
    const known = ['sunny','cloudy','partlycloudy','rainy','pouring','snowy','snowy-rainy','hail','lightning','lightning-rainy','clear-night','fog','windy','windy-variant','droplet'];
    if (!known.includes(condition)) return icon(condition === 'exceptional' ? 'alert' : 'unknown',cls);
    const id = `tehnika-wx-${++weatherIconSequence}`;
    const dimensional = style !== 'flat';
    const glass = style === 'glass';
    const cloudFill = dimensional ? `url(#${id}-cloud)` : 'var(--wx-cloud-solid)';
    const yellowFill = dimensional ? `url(#${id}-sun)` : 'var(--live)';
    const edge = glass ? 'var(--wx-glass-edge)' : 'var(--wx-cloud-edge)';
    const filter = dimensional ? ` filter="url(#${id}-shadow)"` : '';
    const defs = dimensional ? `<defs>
      <linearGradient id="${id}-cloud" x1="12%" y1="0%" x2="70%" y2="100%">
        <stop offset="0" stop-color="var(--wx-cloud-top)" stop-opacity="${glass ? '.82' : '1'}"/>
        <stop offset=".45" stop-color="var(--wx-cloud-mid)" stop-opacity="${glass ? '.4' : '1'}"/>
        <stop offset="1" stop-color="var(--wx-cloud-bottom)" stop-opacity="${glass ? '.55' : '1'}"/>
      </linearGradient>
      <radialGradient id="${id}-sun" cx="32%" cy="22%" r="85%">
        <stop offset="0" stop-color="var(--wx-sun-highlight)"/>
        <stop offset=".32" stop-color="var(--live)"/>
        <stop offset="1" stop-color="var(--wx-shade)" stop-opacity="${glass ? '.62' : '1'}"/>
      </radialGradient>
      <filter id="${id}-shadow" x="-25%" y="-25%" width="150%" height="160%">
        <feDropShadow dx="0" dy="${glass ? '1' : '2'}" stdDeviation="${glass ? '1' : '1.6'}" flood-color="var(--wx-shadow)" flood-opacity="${glass ? '.2' : '.35'}"/>
      </filter>
    </defs>` : '';
    const cloud = (transform = '') => `<g${transform ? ` transform="${transform}"` : ''}${filter}>
      <path d="M25 68C15 68 9 61 10 51C11 42 18 37 27 38C31 25 44 20 55 25C64 28 69 34 70 41C80 40 88 47 88 56C88 64 81 69 72 69Z" fill="${cloudFill}" stroke="${edge}" stroke-width="${glass ? '.9' : '.65'}" vector-effect="non-scaling-stroke"/>
      ${dimensional ? `<path d="M17 49C20 44 24 43 30 44C34 32 43 29 52 31" fill="none" stroke="var(--wx-cloud-top)" stroke-opacity="${glass ? '.8' : '.46'}" stroke-width="${glass ? '1.2' : '2.2'}" stroke-linecap="round"/>` : ''}
      ${glass ? '<path d="M19 62C22 65 27 65 32 65H72" fill="none" stroke="var(--wx-glass-edge)" stroke-opacity=".35" stroke-width="1" stroke-linecap="round"/>' : ''}
    </g>`;
    const sun = (cx=48,cy=45,radius=23,rays=true) => `<g${filter}>
      ${rays ? `<g stroke="var(--live)" stroke-width="${style==='soft'?6:4.5}" stroke-linecap="round">${Array.from({length:8},(_,i)=>{
        const a=i*Math.PI/4;const r1=radius+7,r2=radius+16;
        return `<path d="M${cx+Math.cos(a)*r1} ${cy+Math.sin(a)*r1}L${cx+Math.cos(a)*r2} ${cy+Math.sin(a)*r2}"/>`;
      }).join('')}</g>` : ''}
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${yellowFill}" stroke="var(--wx-shade)" stroke-width="${dimensional?'.8':'0'}"/>
      ${dimensional ? `<path d="M${cx-radius*.65} ${cy-radius*.36}A${radius*.73} ${radius*.73} 0 0 1 ${cx+radius*.24} ${cy-radius*.71}" fill="none" stroke="var(--wx-sun-highlight)" stroke-opacity="${glass?'.9':'.55'}" stroke-width="${glass?1.3:2.4}" stroke-linecap="round"/>` : ''}
    </g>`;
    const drops = () => `<g fill="${cloudFill}" stroke="${edge}" stroke-width="${glass?'.65':'.4'}"${filter}>${[30,49,68].map((x,i)=>`<path transform="translate(${x} ${i===1?77:74})" vector-effect="non-scaling-stroke" d="M0-7C-2-2-6 2-6 6A6 6 0 0 0 6 6C6 2 2-2 0-7Z"/>`).join('')}</g>`;
    const flakes = () => `<g fill="none" stroke="var(--wx-cloud-solid)" stroke-width="2.1" stroke-linecap="round">${[27,49,72].map(x=>`<path transform="translate(${x} 79)" d="M0-8V8M-7-4L7 4M-7 4L7-4M-2-7L0-5L2-7M-2 7L0 5L2 7"/>`).join('')}</g>`;
    const bolt = () => `<path d="M53 54L37 77H49L44 94L70 67H56L64 54Z" fill="${yellowFill}" stroke="var(--wx-shade)" stroke-width="1" stroke-linejoin="round"${filter}/>`;
    let body='';
    if (condition==='sunny') body=sun();
    else if (condition==='cloudy') body=cloud('translate(0 -2)');
    else if (condition==='partlycloudy') body=sun(35,34,17)+cloud('translate(16 18) scale(.8)');
    else if (condition==='rainy'||condition==='pouring') body=cloud('translate(0 -9)')+drops();
    else if (condition==='snowy') body=cloud('translate(0 -10)')+flakes();
    else if (condition==='snowy-rainy') body=cloud('translate(0 -10)')+`<g transform="translate(-9 0)">${flakes()}</g><g transform="translate(30 0) scale(.65 1)">${drops()}</g>`;
    else if (condition==='hail') body=cloud('translate(0 -9)')+`<g fill="${cloudFill}" stroke="${edge}" stroke-width=".6">${[30,49,68].map(x=>`<circle cx="${x}" cy="80" r="5"/>`).join('')}</g>`;
    else if (condition==='lightning'||condition==='lightning-rainy') body=cloud('translate(0 -10)')+(condition==='lightning-rainy'?`<g transform="translate(-8 0) scale(.75 1)">${drops()}</g>`:'')+bolt();
    else if (condition==='clear-night') body=`<g${filter}><path d="M64 12A35 35 0 1 0 80 73A32 32 0 0 1 64 12Z" fill="${yellowFill}" stroke="var(--wx-shade)" stroke-width="${glass?1.3:.6}"/><path d="M79 18L82 25L89 28L82 31L79 38L76 31L69 28L76 25Z" fill="var(--live)"/></g>`;
    else if (condition==='droplet') body=`<g${filter}><path d="M48 12C43 24 25 43 25 57A23 23 0 0 0 71 57C71 43 53 24 48 12Z" fill="${cloudFill}" stroke="${edge}" stroke-width="${glass?'.9':'.65'}" vector-effect="non-scaling-stroke"/>${dimensional?'<path d="M37 39C32 47 30 53 32 59" fill="none" stroke="var(--wx-cloud-top)" stroke-width="2.2" stroke-opacity=".7" stroke-linecap="round"/>':''}</g>`;
    else if (condition==='fog') body=cloud('translate(0 -12)')+'<path d="M17 70H79M11 79H73M23 88H83" fill="none" stroke="var(--quiet)" stroke-width="4" stroke-linecap="round"/>';
    else body=(condition==='windy-variant'?cloud('translate(6 -16) scale(.8)'):'')+'<path d="M10 48H67C85 48 85 25 70 25C62 25 58 30 59 35M7 60H75C88 60 88 80 76 80C68 80 66 74 67 70M14 74H45" fill="none" stroke="var(--wx-cloud-solid)" stroke-width="5" stroke-linecap="round"/>';
    return `<svg class="icon wx-icon ${cls}" data-icon-style="${style}" viewBox="0 0 96 96" aria-hidden="true">${defs}${body}</svg>`;
  }
  function forecastList(value) {
    return Array.isArray(value) ? value.filter(x => x && typeof x === 'object' && Number.isFinite(Date.parse(x.datetime)))
      .map(x => ({...x, time:Date.parse(x.datetime)})).sort((a,b) => a.time-b.time) : [];
  }
  function normalizeAppearance(value = {}) {
    return { ...(value.palette === 'olive' || value.palette === 'graphite' ? {palette:value.palette} : {}),
      ...(['auto','light','dark'].includes(value.mode) ? {mode:value.mode} : {}),
      ...(['flat','soft','glass'].includes(value.icons) ? {icons:value.icons} : {}) };
  }
  function cleanPreferences(value) {
    if (!value || typeof value !== 'object') return null;
    return {version:1, appearance:normalizeAppearance(value.appearance), frame:value.frame === 'off' ? 'off' : 'on',
      updated_at:number(value.updated_at) ?? 0, pending:value.pending === true};
  }
  const CSS = `
    :host{display:block;container-type:inline-size;font:14px/1.35 var(--paper-font-common-base_-_font-family,Roboto,system-ui,sans-serif);font-variant-numeric:tabular-nums;color:var(--ink)}
    *,*::before,*::after{box-sizing:border-box}button,select,input{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}button:disabled{cursor:default;opacity:.45}button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--live);outline-offset:2px}
    ha-card{display:block;background:var(--frame);border:1px solid var(--rim);border-radius:13px;padding:6px;color:var(--ink);box-shadow:none;overflow:visible}ha-card.frameless{background:var(--sf);padding:0;border-radius:17px}.screen{position:relative;display:grid;grid-template-rows:30px minmax(0,1fr)22px;gap:2px;height:258px;min-width:0;padding:12px 14px 8px;background:var(--sf);border-radius:6px}.frameless .screen{border-radius:16px}
    .header{display:flex;align-items:center;gap:10px;min-width:0}.place{font-size:18px;font-weight:500;line-height:1.2;color:var(--ink);margin:0;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.t-button{display:grid;place-items:center;flex:none;width:30px;height:30px;padding:0;border:1.5px solid var(--quiet);border-radius:50%;background:transparent;color:var(--quiet);font-size:19px;font-weight:500;line-height:1}.t-button:hover,.t-button[aria-expanded=true]{background:var(--fc);color:var(--ink)}
    .icon{display:block;width:22px;height:22px;flex:none}.wx-icon{overflow:visible}.page{min-width:0;min-height:0;overflow:hidden}.main-page{height:100%;display:flex;flex-direction:column}.hero-line{display:flex;align-items:center;justify-content:space-between;flex:1;min-height:0;width:100%;padding:0 3px;border:0;background:transparent;text-align:left;gap:12px}.hero-temperature{display:flex;align-items:baseline;color:var(--ink);white-space:nowrap;line-height:1;letter-spacing:-2px}.hero-value{font-size:clamp(52px,20cqi,76px);font-weight:500}.hero-degree{font-size:.8em;vertical-align:top}.hero-unit{align-self:flex-start;font-size:14px;letter-spacing:0;margin:8px 0 0 3px;color:var(--quiet)}.hero-icon{width:clamp(68px,24cqi,88px);height:clamp(68px,24cqi,88px)}
    .main-metrics{display:flex;align-items:center;justify-content:space-around;flex:none;height:25px;min-width:0;gap:8px;overflow:hidden}.main-metric{display:flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;min-width:0;font-size:13px;color:var(--ink)}.main-metric+.main-metric{border-left:1px solid var(--edge);padding-left:10px}.main-metric .icon{height:17px;width:17px;color:var(--quiet)}.main-metric .wx-icon{height:21px;width:21px}.metric-unit{font-size:11px;color:var(--quiet)}.main-metric .metric-value{font-weight:500}
    .hour-strip{height:70px;flex:none;margin-top:2px;padding-top:7px;border-top:1px solid var(--edge);min-width:0;overflow:hidden}.hours{display:grid;grid-template-columns:repeat(var(--count),minmax(0,1fr));gap:2px;height:100%;min-width:0}.hour{display:grid;grid-template-rows:13px 27px 18px;justify-items:center;align-items:center;gap:1px;min-width:0;padding:0 1px;border:1px solid transparent;border-radius:5px;color:var(--ink);background:transparent}.hour:hover,.day:hover{background:var(--fc);border-color:var(--edge)}.hour-time{font-size:11px;color:var(--quiet)}.hour:first-child .hour-time{font-size:12px;font-weight:500;color:var(--ink)}.hour .icon{width:27px;height:27px}.hour-temp{font-size:13px;font-weight:500;white-space:nowrap}.page-switch{display:grid;place-items:center;width:100%;height:22px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--ink)}.page-switch:hover{background:var(--fc)}.page-switch .icon{width:24px;height:24px}.page-switch .up{transform:rotate(180deg)}
    .daily-page{display:grid;grid-template-rows:repeat(5,minmax(0,1fr));height:100%;gap:1px}.day{display:grid;grid-template-columns:62px 28px 32px minmax(18px,1fr)32px;align-items:center;gap:8px;width:100%;min-width:0;min-height:0;padding:0 2px;border:1px solid transparent;border-bottom-color:var(--edge);border-radius:3px;background:transparent;color:var(--ink);text-align:left}.day:last-child{border-bottom-color:transparent}.day-name{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.day .icon{width:28px;height:28px}.day-low,.day-high{font-size:13px;white-space:nowrap;text-align:right}.day-low{color:var(--quiet)}.day-high{font-weight:500}.day-range{position:relative;height:7px;background:var(--off);border-radius:5px;overflow:hidden}.day-range span{position:absolute;inset:0 auto 0 0;border-radius:5px;background:var(--live)}
    .empty-state{display:flex;align-items:center;justify-content:center;height:100%;min-height:0;padding:4px 6px;font-size:12px;line-height:1.4;color:var(--quiet);text-align:center;margin:0}.empty-state.warning{color:var(--warn)}.source-note{font-size:10px;color:var(--quiet);margin-top:10px}.detail-description{font-size:12px;color:var(--quiet)}.hint{font-size:11px;color:var(--quiet);margin:8px 0}.warning-box{color:var(--warn);background:var(--warnbg);border:1px solid var(--warnline);border-radius:8px;padding:8px 10px;font-size:12px}
    .weather-dialog{position:fixed;inset:0;margin:auto;width:360px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);padding:6px;border:1px solid var(--rim);border-radius:13px;color:var(--ink);background:var(--frame);box-shadow:var(--popshadow);font:inherit;font-variant-numeric:tabular-nums;overflow:hidden;overscroll-behavior:contain}.weather-dialog:not([open]){display:none}.weather-dialog::backdrop{background:var(--dialogbackdrop);touch-action:none}.weather-dialog.frameless{padding:0;background:var(--sf);border-radius:17px}.dialog-inner{container-type:inline-size;min-width:0;background:var(--sf);border-radius:6px;overflow:hidden}.frameless .dialog-inner{border-radius:16px}.dialog-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--edge)}.dialog-heading{min-width:0;flex:1}.dialog-heading h2{font-size:16px;font-weight:500;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dialog-city{font-size:11px;color:var(--quiet);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}.icon-button{width:30px;height:30px;display:grid;place-items:center;flex:none;border:1px solid transparent;border-radius:8px;padding:3px;color:var(--quiet);background:transparent}.icon-button:hover{border-color:var(--edge);background:var(--fc)}.icon-button .icon{width:20px;height:20px}.dialog-scroll{padding:0 14px 14px;max-height:calc(100dvh - 110px);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--ring) var(--sf)}.field-label{display:block;font-size:12px;color:var(--quiet);margin:12px 0 7px}.segments{display:flex;gap:4px}.segments button{flex:1;border:1px solid var(--edge);border-radius:7px;padding:7px 5px;font-size:12px;color:var(--quiet);background:var(--fc)}.segments button[aria-pressed=true]{color:var(--onlive);background:var(--live);border-color:var(--live);font-weight:500}.icon-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.icon-choice{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:0;min-height:78px;padding:6px 3px;border:1px solid var(--edge);border-radius:8px;background:var(--fc);color:var(--quiet);font-size:10px;line-height:1.25;text-align:center}.icon-choice[aria-pressed=true]{border-color:var(--live);box-shadow:inset 0 0 0 1px var(--live);color:var(--ink)}.icon-choice .icon{width:42px;height:42px}.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;font-size:13px}.toggle-row input{width:18px;height:18px;accent-color:var(--live)}.save-status{color:var(--quiet);font-size:11px;min-height:30px;margin-top:12px;padding-top:9px;border-top:1px solid var(--edge)}.detail-weather{display:flex;align-items:center;gap:12px;margin:12px 0}.detail-weather .icon{width:56px;height:56px}.detail-weather strong{font-size:32px;font-weight:500}.detail-weather small{font-size:14px;color:var(--quiet);font-weight:400}.detail-row{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--edge);font-size:12px}.detail-row span:first-child{color:var(--quiet)}.detail-row span:last-child{text-align:right}.period-heading{font-size:12px;font-weight:500;margin:12px 0 4px;color:var(--ink)}
    @container(max-width:359px){.secondary{display:none!important}.hero-value{font-size:clamp(52px,20cqi,70px)}.main-metric{font-size:12px;gap:3px}.main-metric+.main-metric{padding-left:7px}.day{grid-template-columns:56px 26px 28px minmax(18px,1fr)28px;gap:6px}.day-name{font-size:11px}.day-low,.day-high{font-size:12px}.hour-temp{font-size:12px}.hour .icon{width:25px;height:25px}}
    @container(max-width:269px){.screen{padding-left:10px;padding-right:10px}.place{font-size:16px}.main-metrics{gap:3px}.main-metric{font-size:11px;gap:2px}.main-metric+.main-metric{padding-left:4px}.main-metric .icon{width:14px;height:14px}.main-metric .wx-icon{width:17px;height:17px}.metric-unit{font-size:9px}.day{grid-template-columns:49px 23px 26px minmax(12px,1fr)26px;gap:4px}.day .icon{width:23px;height:23px}.hour-temp{font-size:11px}.hour .icon{width:22px;height:22px}.hour-time{font-size:10px}.icon-choice{font-size:9px}}

  `;

  class PogodaTehnikaCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      // Keep the native dialog node stable while HA state and forecast events update.
      // showModal() puts it in the browser's top layer, outside dashboard clipping.
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="card-root"></div><dialog class="weather-dialog" aria-labelledby="weather-dialog-title"></dialog>`;
      this._cardRoot = this.shadowRoot.querySelector('.card-root');
      this._dialog = this.shadowRoot.querySelector('.weather-dialog');
      this._dialog.addEventListener('cancel', event => { event.preventDefault(); this._close(); });
      this._dialog.addEventListener('click', event => {
        if (event.target !== this._dialog) return;
        const rect = this._dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this._close();
      });
      this._forecasts = {}; this._subscriptions = []; this._forecastEpoch = 0; this._page = 'main';
      this._appearance = {}; this._frame = readCache(FRAME_KEY) === 'off' ? 'off' : 'on';
      this._saveQueue = Promise.resolve(); this._profileEpoch = 0;
      this._onFrame = e => {
        this._frame = e.detail === 'off' ? 'off' : 'on';
        this._render(); this._persistPreferences();
      };
      this._onStorage = e => {
        if (e.key === FRAME_KEY || e.key === null) {
          this._frame = readCache(FRAME_KEY) === 'off' ? 'off' : 'on'; this._render(); this._persistPreferences();
        } else if (e.key === this._cacheKey) this._acceptPreferences(cleanPreferences(parse(e.newValue)));
      };
      this._onPreferences = e => {
        if (e.detail?.key === this._cacheKey && e.detail.source !== this) this._acceptPreferences(e.detail.value);
      };
      this._onOutside = e => { if (this._open && !e.composedPath().includes(this)) this._close(); };
      this._onVisibility = () => { if (!document.hidden) { this._sync(); this._render(); } };
      this.shadowRoot.addEventListener('click', e => this._click(e));
      this.shadowRoot.addEventListener('change', e => this._change(e));
      this.shadowRoot.addEventListener('keydown', e => this._keydown(e));
    }
    static get version() { return VERSION; }
    static getStubConfig(hass) {
      const entities = Object.keys(hass?.states || {}).filter(id => id.startsWith('weather.'));
      const entity = entities.find(id => !['unavailable','unknown'].includes(hass.states[id].state)) || entities[0] || '';
      return {type:`custom:${TAG}`, entity};
    }
    static getConfigElement() { return document.createElement(`${TAG}-editor`); }
    setConfig(config) {
      if (!config || (config.entity && (typeof config.entity !== 'string' || !config.entity.startsWith('weather.')))) throw new Error('Оберіть сутність погоди weather.*');
      if (config.palette !== undefined && !['olive','graphite'].includes(config.palette)) throw new Error('Палітра: olive або graphite');
      if (config.mode !== undefined && !['auto','light','dark'].includes(config.mode)) throw new Error('Оформлення: auto, light або dark');
      if (config.icon_style !== undefined && !['flat','soft','glass'].includes(config.icon_style)) throw new Error('Значки: flat, soft або glass');
      for (const key of ['show_hourly','show_daily','show_precipitation']) if (config[key] !== undefined && typeof config[key] !== 'boolean') throw new Error(`${key}: потрібне значення true або false`);
      for (const [key,min,max] of [['hours',3,8],['days',3,7]]) if (config[key] !== undefined && (!Number.isInteger(config[key]) || config[key]<min || config[key]>max)) throw new Error(`${key}: ціле число від ${min} до ${max}`);
      this._config = {...DEFAULTS,...config}; this._page = 'main';
      this._open = null; this._detail = null;
      this._sync(); this._render();
    }
    set hass(hass) {
      const previous = this._hass;
      this._hass = hass;
      this._sync();
      const entity = this._entity();
      if (!previous || previous.states?.[entity] !== hass.states?.[entity] || previous.states?.['sun.sun'] !== hass.states?.['sun.sun'] || previous.themes?.darkMode !== hass.themes?.darkMode) this._render();
    }
    get hass() { return this._hass; }
    connectedCallback() {
      window.addEventListener(FRAME_EVENT,this._onFrame);
      window.addEventListener('storage',this._onStorage);
      window.addEventListener(PREF_EVENT,this._onPreferences);
      document.addEventListener('pointerdown',this._onOutside);
      document.addEventListener('visibilitychange',this._onVisibility);
      this._frame = readCache(FRAME_KEY) === 'off' ? 'off' : 'on';
      this._timer = setInterval(() => { this._sync(); this._render(); },30000);
      this._sync(); this._render();
    }
    disconnectedCallback() {
      window.removeEventListener(FRAME_EVENT,this._onFrame);
      window.removeEventListener('storage',this._onStorage);
      window.removeEventListener(PREF_EVENT,this._onPreferences);
      document.removeEventListener('pointerdown',this._onOutside);
      document.removeEventListener('visibilitychange',this._onVisibility);
      clearInterval(this._timer); this._timer = null;
      this._stopForecasts(); this._stopProfile(); this._open = null;
      this._detail = null; if (this._dialog.open) this._dialog.close();
    }
    getCardSize() { return Math.ceil((this.shadowRoot.querySelector('ha-card')?.getBoundingClientRect().height || 250)/50); }
    getGridOptions() { return {columns:12,rows:'auto',min_columns:6}; }
    _entity() { return this._config?.entity || PogodaTehnikaCard.getStubConfig(this._hass).entity; }
    _state() { return this._hass?.states?.[this._entity()]; }
    _sync() {
      if (!this.isConnected || !this._config || !this._hass) return;
      this._syncProfile(); this._syncForecasts();
    }
    _stopForecasts() {
      this._forecastEpoch++;
      for (const unsubscribe of this._subscriptions) { try { Promise.resolve(unsubscribe()).catch(()=>{}); } catch {} }
      this._subscriptions = []; this._forecastSignature = null; this._forecastConnection = null;
    }
    _syncForecasts() {
      if (!this.isConnected || !this._config || !this._hass) return;
      const connection = this._hass.connection;
      const state = this._state();
      const features = Number(state?.attributes?.supported_features || 0);
      const unavailable = !state || ['unavailable','unknown'].includes(state.state);
      const types = unavailable ? [] : [ ...((this._config.show_hourly || this._config.show_precipitation) && features & 2 ? ['hourly'] : []),
        ...(this._config.show_daily && features & 1 ? ['daily'] : this._config.show_daily && features & 4 ? ['twice_daily'] : []) ];
      const signature = JSON.stringify([this._entity(),types,unavailable]);
      if (this._forecastSignature === signature && this._forecastConnection === connection && (!this._retryForecast || Date.now()<this._retryForecast)) return;
      this._stopForecasts(); this._forecasts = {}; this._forecastErrors = {}; this._retryForecast = 0;
      this._forecastSignature = signature; this._forecastConnection = connection;
      const epoch = this._forecastEpoch;
      if (!connection?.subscribeMessage) { if (types.length) this._forecastErrors.connection = true; return; }
      for (const type of types) {
        Promise.resolve().then(() => connection.subscribeMessage(event => {
          if (epoch !== this._forecastEpoch || !this.isConnected) return;
          this._forecasts[type] = forecastList(event?.forecast); delete this._forecastErrors[type]; this._render();
        },{type:'weather/subscribe_forecast',entity_id:this._entity(),forecast_type:type}))
          .then(unsubscribe => {
            if (epoch !== this._forecastEpoch || !this.isConnected) { try { Promise.resolve(unsubscribe()).catch(()=>{}); } catch {} }
            else this._subscriptions.push(unsubscribe);
          }).catch(() => {
            if (epoch !== this._forecastEpoch) return;
            this._forecastErrors[type] = true; this._retryForecast = Date.now()+60000; this._render();
          });
      }
    }
    _stopProfile() {
      this._profileEpoch++;
      if (this._profileUnsubscribe) { try { Promise.resolve(this._profileUnsubscribe()).catch(()=>{}); } catch {} }
      this._profileUnsubscribe = null; this._profileIdentity = null; this._profileConnection = null;
    }
    _syncProfile() {
      const user = this._hass.user?.id;
      if (!user) return;
      const profileKey = `tehnika-weather:${this._config.preferences_id || this._entity() || 'default'}`;
      const identity = `${user}:${profileKey}`;
      if (identity === this._profileIdentity && this._profileConnection === this._hass.connection && (this._profileStatus !== 'local' || Date.now() < (this._profileRetryAt || 0))) return;
      this._stopProfile(); this._profileIdentity = identity; this._profileConnection = this._hass.connection;
      this._profileKey = profileKey; this._cacheKey = `${location.origin}:${identity}`;
      this._appearance = {}; this._prefsStamp = 0; this._pendingPreferences = false;
      this._acceptPreferences(cleanPreferences(parse(readCache(this._cacheKey))));
      const epoch = this._profileEpoch;
      const hass = this._hass;
      this._profileStatus = 'loading';
      Promise.resolve().then(() => hass.callWS({type:'frontend/get_user_data',key:profileKey})).then(result => {
        if (epoch !== this._profileEpoch || !this.isConnected) return;
        this._acceptPreferences(cleanPreferences(result?.value),true);
        this._profileStatus = 'saved';
        if (this._pendingPreferences) this._persistPreferences();
        this._render();
      }).catch(() => { if (epoch === this._profileEpoch) { this._profileStatus = 'local'; this._profileRetryAt = Date.now()+60000; this._render(); } });
      if (hass.connection?.subscribeMessage) Promise.resolve().then(() => hass.connection.subscribeMessage(event => {
        if (epoch === this._profileEpoch && this.isConnected) this._acceptPreferences(cleanPreferences(event?.value),true);
      },{type:'frontend/subscribe_user_data',key:profileKey})).then(unsubscribe => {
        if (epoch !== this._profileEpoch || !this.isConnected) { try { Promise.resolve(unsubscribe()).catch(()=>{}); } catch {} }
        else this._profileUnsubscribe = unsubscribe;
      }).catch(()=>{}); // Older HA versions still load and save via get/set_user_data.
    }
    _acceptPreferences(value,remote = false) {
      if (!value || value.updated_at < (this._prefsStamp || 0)) return;
      const oldStamp = this._prefsStamp || 0;
      this._prefsStamp = value.updated_at; this._appearance = normalizeAppearance(value.appearance);
      if (!remote) this._pendingPreferences = value.pending;
      else if (value.updated_at > oldStamp) this._pendingPreferences = false;
      // The common local key is authoritative when it already exists on this device.
      if (readCache(FRAME_KEY) === null) {
        this._frame = value.frame;
        writeCache(FRAME_KEY,value.frame);
        window.dispatchEvent(new CustomEvent(FRAME_EVENT,{detail:value.frame}));
      }
      if (this._cacheKey && value.updated_at === this._prefsStamp) writeCache(this._cacheKey,JSON.stringify({...value,pending:this._pendingPreferences}));
      this._render();
    }
    _persistPreferences() {
      if (!this._cacheKey || !this._hass?.callWS) return;
      const value = {version:1,appearance:{...this._appearance},frame:this._frame,updated_at:Math.max(Date.now(),(this._prefsStamp || 0)+1)};
      this._prefsStamp = value.updated_at; this._pendingPreferences = true;
      writeCache(this._cacheKey,JSON.stringify({...value,pending:true}));
      window.dispatchEvent(new CustomEvent(PREF_EVENT,{detail:{key:this._cacheKey,value:{...value,pending:true},source:this}}));
      const hass = this._hass, key = this._profileKey, epoch = this._profileEpoch;
      this._profileStatus = 'saving'; this._render();
      this._saveQueue = this._saveQueue.catch(()=>{}).then(() => hass.callWS({type:'frontend/set_user_data',key,value})).then(() => {
        if (epoch !== this._profileEpoch || this._prefsStamp !== value.updated_at) return;
        this._pendingPreferences = false; this._profileStatus = 'saved';
        writeCache(this._cacheKey,JSON.stringify({...value,pending:false})); this._render();
      }).catch(() => { if (epoch === this._profileEpoch) { this._profileStatus = 'local'; this._profileRetryAt = Date.now()+60000; this._render(); } });
    }
    _colors() {
      const palette = this._appearance.palette || this._config.palette;
      const mode = this._appearance.mode || this._config.mode;
      const dark = mode === 'dark' || mode === 'auto' && !!this._hass?.themes?.darkMode;
      const base = PALETTES[palette];
      const tone = base[dark?'dark':'light'];
      return {...base[dark?'dark':'light'], frame:base.frame,rim:base.rim,
        live:dark?'#ffcc1f':'#ffc20e',fcink:dark?'#ffcc1f':'#6b4f00',onlive:'#3a2f0a',
        stripe:`repeating-linear-gradient(135deg, ${dark?'#ffcc1f':'#ffc20e'} 0 2.5px, ${dark?'#b08a14':'#b08300'} 2.5px 5px)`,
        warn:dark?'#ff8a50':'#c2410c',warnbg:dark?'rgba(255,138,80,.14)':'rgba(234,88,12,.12)',warnline:dark?'rgba(255,138,80,.45)':'rgba(194,65,12,.45)',
        popshadow:`0 10px 28px rgba(0,0,0,${dark?'.45':'.2'})`,tick:dark?'rgba(255,255,255,.22)':'rgba(0,0,0,.42)',
        past:dark?'rgba(0,0,0,.45)':'rgba(255,255,255,.45)',nowbg:dark?'#f5f5f0':'#2a2f33',nowink:dark?'#2a2f33':'#fff',
        dialogbackdrop:dark?'rgba(0,0,0,.45)':'rgba(0,0,0,.2)',
        'wx-cloud-solid':dark?tone.quiet:tone.popbg,'wx-cloud-top':dark?tone.ink:tone.popbg,
        'wx-cloud-mid':dark?tone.quiet:tone.sf,'wx-cloud-bottom':dark?tone.ring:tone.edge,
        'wx-cloud-edge':dark?tone.ring:tone.quiet,'wx-glass-edge':dark?tone.ink:tone.quiet,
        'wx-sun-highlight':dark?tone.ink:tone.popbg,'wx-shade':dark?'#b08a14':'#b08300','wx-shadow':tone.fc};
    }
    _weatherIcon(condition, cls = '') {
      return weatherIcon(condition,cls,this._appearance.icons || this._config.icon_style);
    }
    _hours() {
      return (this._forecasts.hourly || []).filter(x => x.time+HOUR>Date.now()).slice(0,this._config.hours);
    }
    _days() {
      const today = dayKey(Date.now());
      const daily = (this._forecasts.daily || []).filter(x => dayKey(x.time)>=today);
      if (daily.length) {
        const seen=new Set();
        return daily.filter(x=>{const key=dayKey(x.time);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,5);
      }
      // A day/night source may provide several periods per calendar day. Group
      // those periods; never present two periods as two different calendar days.
      const groups=new Map();
      for (const entry of this._forecasts.twice_daily || []) {
        const key=dayKey(entry.time);if(key<today)continue;
        if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);
      }
      return [...groups.values()].slice(0,5).map(periods=>{
        const representative=periods.find(x=>x.is_daytime===true) || periods[0];
        const values=periods.flatMap(x=>[number(x.temperature),number(x.templow)]).filter(x=>x!==null);
        return {...representative,periods,
          temperature:values.length?Math.max(...values):null,
          templow:values.length>1?Math.min(...values):number(representative.templow)};
      });
    }
    _temperature(value) { return `${signed(value)}${number(value) === null ? '' : '°'}`; }
    _precipitation(value) {
      if(percent(value.precipitation_probability)!==null)return `${fmt(percent(value.precipitation_probability))}%`;
      if(number(value.precipitation)!==null)return `${fmt(value.precipitation,1)} ${esc(this._state()?.attributes?.precipitation_unit || '')}`.trim();
      return '';
    }
    _briefStatus(type,available) {
      if(!available)return !this._entity()?'Оберіть погодну сутність у редакторі.':!this._state()?'Погодну сутність не знайдено.':'Джерело погоди зараз недоступне.';
      if(type==='hourly'&&!this._config.show_hourly)return 'Погодинний прогноз вимкнено.';
      if(type==='daily'&&!this._config.show_daily)return 'Добовий прогноз вимкнено.';
      const features=Number(this._state()?.attributes?.supported_features || 0);
      if(!(features & (type==='hourly'?2:5)))return type==='hourly'?'Джерело не надає погодинного прогнозу.':'Джерело не надає добового прогнозу.';
      if(this._forecastErrors?.[type] || type==='daily'&&this._forecastErrors?.twice_daily || this._forecastErrors?.connection)return 'Прогноз тимчасово недоступний. Повторюємо підключення…';
      if(!(type in this._forecasts)&&!(type==='daily'&&'twice_daily' in this._forecasts))return 'Завантаження прогнозу…';
      return 'Джерело поки не надало прогнозу.';
    }
    _probability() {
      const current=percent(this._state()?.attributes?.precipitation_probability);
      if(current!==null)return {value:current,label:'Ймовірність опадів'};
      const entry=this._hours()[0];const value=entry?percent(entry.precipitation_probability):null;
      return value===null?null:{value,label:`Ймовірність опадів · ${dateFmt(entry.time,{hour:'2-digit',minute:'2-digit'})}`};
    }
    _render() {
      if(!this._config)return;
      const focusKey=this.shadowRoot.activeElement?.dataset.focus;
      for(const [key,value] of Object.entries(this._colors()))this.style.setProperty(`--${key}`,value);
      const state=this._state();
      const available=!!state&&!['unknown','unavailable'].includes(state.state);
      const attr=available?state.attributes || {}:{};
      const condition=available?state.state:state?.state || 'unknown';
      const name=String(state?.attributes?.friendly_name || this._entity() || 'Погода');
      const daily=this._page==='daily';
      const unit=attr.temperature_unit || '°C';
      const degree=String(unit).startsWith('°');
      const temperature=`<span class="hero-value">${signed(attr.temperature)}${number(attr.temperature)!==null&&degree?'<span class="hero-degree">°</span>':''}</span>${number(attr.temperature)!==null?`<span class="hero-unit">${esc(degree?String(unit).slice(1):unit)}</span>`:''}`;
      const metrics=[];
      if(number(attr.wind_speed)!==null)metrics.push(`<span class="main-metric" title="Вітер" aria-label="Вітер: ${fmt(attr.wind_speed,1)} ${esc(this._windUnit())}">${icon('wind')}<span class="metric-value">${fmt(attr.wind_speed,1)}</span><span class="metric-unit">${esc(this._windUnit())}</span></span>`);
      if(number(attr.humidity)!==null)metrics.push(`<span class="main-metric" title="Вологість" aria-label="Вологість: ${fmt(attr.humidity)}%">${this._weatherIcon('droplet')}<span class="metric-value">${fmt(attr.humidity)}%</span></span>`);
      const probability=available&&this._config.show_precipitation?this._probability():null;
      if(probability)metrics.push(`<span class="main-metric" title="${esc(probability.label)}" aria-label="${esc(probability.label)}: ${fmt(probability.value)}%">${this._weatherIcon('rainy')}<span class="metric-value">${fmt(probability.value)}%</span></span>`);
      const main=`<div class="main-page"><button class="hero-line" data-action="current" data-focus="current" aria-label="${esc(CONDITIONS[condition] || 'Погода')}, ${signed(attr.temperature)} ${esc(unit)}. Докладніше" aria-haspopup="dialog" title="${esc(CONDITIONS[condition] || 'Погода')}"><span class="hero-temperature">${temperature}</span>${this._weatherIcon(condition,'hero-icon')}</button>${metrics.length?`<div class="main-metrics">${metrics.join('')}</div>`:''}<div class="hour-strip">${this._config.show_hourly?this._renderHourly():''}${!this._config.show_hourly||!this._hours().length?`<p class="empty-state ${!available?'warning':''}" role="status">${esc(this._briefStatus('hourly',available))}</p>`:''}</div></div>`;
      this._cardRoot.innerHTML=`<ha-card class="${this._frame==='off'?'frameless':''}"><div class="screen"><header class="header"><h2 class="place" title="${esc(name)}">${esc(name)}</h2><button class="t-button" data-action="settings" data-focus="settings" aria-label="Налаштування вигляду" aria-haspopup="dialog" aria-expanded="${this._open==='settings'}">Т</button></header><div class="page" id="weather-page" data-page="${daily?'daily':'main'}">${daily?this._renderDaily(available):main}</div><button class="page-switch" data-action="page" data-focus="page-switch" aria-label="${daily?'Повернути поточну погоду':'Показати прогноз на 5 днів'}" title="${daily?'Поточна погода':'Прогноз на 5 днів'}" aria-controls="weather-page" aria-expanded="${daily}" ${!daily&&!this._config.show_daily?'disabled':''}>${icon('expand',daily?'up':'')}</button></div></ha-card>`;
      this._renderDialog(attr,condition,name);
      if(focusKey)this.shadowRoot.querySelector(`[data-focus="${focusKey}"]`)?.focus({preventScroll:true});
    }
    _windUnit() {
      const unit=this._state()?.attributes?.wind_speed_unit || '';
      return ({'km/h':'км/год','m/s':'м/с','mph':'миль/год','kn':'вузл.'})[unit] || unit;
    }
    _dataRows(entry,forecast=false) {
      const attr=this._state()?.attributes || {};
      const fields=[['Відчувається як',entry.apparent_temperature,attr.temperature_unit || '°C'],['Вітер',entry.wind_speed,this._windUnit()],['Вологість',entry.humidity,'%'],['Тиск',entry.pressure,attr.pressure_unit || ''],
        ...(forecast?[['Ймовірність опадів',percent(entry.precipitation_probability),'%'],['Кількість опадів',entry.precipitation,attr.precipitation_unit || ''],['Нижня температура',entry.templow,attr.temperature_unit || '°C']]:[])];
      return fields.filter(([,value])=>number(value)!==null).map(([label,value,unit])=>`<div class="detail-row"><span>${label}</span><span>${fmt(value,1)}${unit?` ${esc(unit)}`:''}</span></div>`).join('');
    }
    _renderDialog(attr,condition,name) {
      const dialog=this._dialog;
      if(!this._open){if(dialog.open)dialog.close();dialog.innerHTML='';return;}
      const previousView=dialog.dataset.view;
      const scroll=dialog.querySelector('.dialog-scroll')?.scrollTop || 0;
      const settings=this._open==='settings';
      const current=this._open==='current';
      const entry=current?{...attr,condition}:this._detail?.entry || {};
      const title=settings?'Вигляд картки':current?'Поточна погода':this._detail?dateFmt(this._detail.time,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Прогноз';
      const content=settings?this._settingsContent():this._detailContent(entry,!current);
      dialog.className=`weather-dialog ${this._frame==='off'?'frameless':''}`;
      dialog.dataset.view=this._open;
      dialog.innerHTML=`<div class="dialog-inner"><header class="dialog-head"><div class="dialog-heading"><h2 id="weather-dialog-title">${esc(title)}</h2><div class="dialog-city">${esc(name)}</div></div><button class="icon-button" data-action="close" data-focus="close" aria-label="Закрити">${icon('close')}</button></header><div class="dialog-scroll" data-view="${this._open}">${content}</div></div>`;
      if(!dialog.open&&this.isConnected)dialog.showModal();
      const scroller=dialog.querySelector('.dialog-scroll');if(scroller&&previousView===this._open)scroller.scrollTop=scroll;
    }
    _renderHourly() {
      const list=this._hours();if(!list.length)return '';
      return `<div class="hours" style="--count:${list.length}">${list.map((entry,index)=>`<button class="hour" data-action="hour" data-index="${index}" data-focus="hour-${index}" aria-label="${esc(dateFmt(entry.time,{hour:'2-digit',minute:'2-digit'}))}, ${esc(CONDITIONS[entry.condition] || 'Погода')}, ${this._temperature(entry.temperature)}" aria-haspopup="dialog"><span class="hour-time">${dateFmt(entry.time,{hour:'2-digit',hourCycle:'h23'})}</span>${this._weatherIcon(entry.condition)}<span class="hour-temp">${this._temperature(entry.temperature)}</span></button>`).join('')}</div>`;
    }
    _renderDaily(available) {
      const list=this._config.show_daily?this._days():[];
      if(!list.length)return `<p class="empty-state ${!available?'warning':''}" role="status">${esc(this._briefStatus('daily',available))}</p>`;
      const values=list.flatMap(x=>[number(x.templow),number(x.temperature)]).filter(x=>x!==null);
      const min=values.length?Math.min(...values):0,max=values.length?Math.max(...values):1,span=Math.max(1,max-min);
      return `<div class="daily-page">${list.map((entry,index)=>{
        const low=number(entry.templow),high=number(entry.temperature);
        const left=low===null?0:(low-min)/span*100;
        const width=low===null||high===null?0:Math.min(100-left,Math.max(3,(high-low)/span*100));
        return `<button class="day" data-action="day" data-index="${index}" data-focus="day-${index}" aria-label="${esc(dateFmt(entry.time,{weekday:'long',day:'numeric',month:'long'}))}, ${esc(CONDITIONS[entry.condition] || 'Погода')}${low===null?'':`, нижня ${this._temperature(low)}`}${high===null?'':`, верхня ${this._temperature(high)}`}" aria-haspopup="dialog"><span class="day-name">${dayKey(entry.time)===dayKey(Date.now())?'Сьогодні':dateFmt(entry.time,{weekday:'short'})}</span>${this._weatherIcon(entry.condition)}<span class="day-low">${low===null?'':this._temperature(low)}</span><span class="day-range" ${low===null||high===null?'style="visibility:hidden"':''}><span style="left:${left}%;width:${width}%"></span></span><span class="day-high">${high===null?'':this._temperature(high)}</span></button>`;
      }).join('')}</div>`;
    }
    _settingsContent() {
      const segment=(key,label,options,current)=>`<span class="field-label">${label}</span><div class="segments" role="group" aria-label="${label}">${options.map(([value,text])=>`<button data-action="appearance" data-key="${key}" data-value="${value}" data-focus="${key}-${value}" aria-pressed="${current===value}">${text}</button>`).join('')}</div>`;
      const selected=this._appearance.icons || this._config.icon_style;
      const choices=[['flat','Пласкі'],['soft','М’який об’єм'],['glass','Матове скло']];
      return `<span class="field-label">Значки погоди</span><div class="icon-options" role="group" aria-label="Стиль значків">${choices.map(([value,label])=>`<button class="icon-choice" data-action="appearance" data-key="icons" data-value="${value}" data-focus="icons-${value}" aria-pressed="${selected===value}">${weatherIcon('partlycloudy','',value)}<span>${label}</span></button>`).join('')}</div>${segment('palette','Палітра',[['olive','Олива'],['graphite','Графіт']],this._appearance.palette || this._config.palette)}${segment('mode','Оформлення',[['auto','Авто'],['light','Світла'],['dark','Темна']],this._appearance.mode || this._config.mode)}<label class="toggle-row" for="frame-toggle">Рамка<input id="frame-toggle" data-action="frame" data-focus="frame" type="checkbox" ${this._frame==='on'?'checked':''}></label><p class="hint">Спільна для всіх карток ТЕХНіКА на цьому пристрої. «Авто» використовує тему Home Assistant.</p><div class="save-status" role="status">${({loading:'Завантажуємо ваші налаштування…',saving:'Зберігаємо в профілі HA…',saved:'Вигляд збережено у вашому профілі HA.',local:'Збережено на пристрої. Профіль HA поки недоступний.'})[this._profileStatus] || 'Вигляд зберігається у вашому профілі HA.'}</div>`;
    }
    _detailContent(entry,forecast=false) {
      const unit=esc(this._state()?.attributes?.temperature_unit || '°C');
      const rows=this._dataRows(entry,forecast);
      if(number(entry.temperature)===null&&!entry.condition&&!rows)return '<p class="hint">Для цього періоду немає даних прогнозу.</p>';
      const periods=entry.periods?.map(period=>`<h3 class="period-heading">${period.is_daytime===true?'День':period.is_daytime===false?'Ніч':'Період'} · ${signed(period.temperature)} ${unit}</h3>${this._dataRows(period,true)}`).join('') || '';
      return `<div class="detail-weather">${this._weatherIcon(entry.condition)}<div>${number(entry.temperature)!==null?`<strong>${signed(entry.temperature)} <small>${unit}</small></strong>`:''}${entry.condition?`<div class="detail-description">${esc(CONDITIONS[entry.condition] || 'Погодні дані')}</div>`:''}</div></div>${rows}${periods}${periods?'<p class="hint">Діапазон температур за доступними прогнозами дня та ночі.</p>':''}<p class="source-note">Київський час${this._state()?.attributes?.attribution?` · ${esc(this._state().attributes.attribution)}`:''}</p>`;
    }
    _click(event) {
      const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
      const action=button.dataset.action;
      if(action==='frame')return;
      if(action==='appearance'){
        this._appearance[button.dataset.key]=button.dataset.value;this._persistPreferences();this._render();return;
      }
      if(action==='close'||action==='back'){this._close();return;}
      if(action==='page'){
        this._page=this._page==='daily'?'main':'daily';this._render();
        this._cardRoot.querySelector('[data-focus=page-switch]')?.focus({preventScroll:true});return;
      }
      if(!this._open)this._returnFocus=button.dataset.focus;
      if(action==='settings'||action==='current'){this._open=action;this._detail=null;}
      else if(action==='day'||action==='hour'){
        const i=Number(button.dataset.index);const entry=(action==='day'?this._days():this._hours())[i];
        if(!entry)return;this._open='detail';this._detail={entry,time:entry.time};
      }else return;
      this._render();this._dialog.querySelector('[data-action=close]')?.focus({preventScroll:true});
    }
    _change(event) {
      if (event.target.dataset.action!=='frame') return;
      this._frame=event.target.checked?'on':'off'; writeCache(FRAME_KEY,this._frame);
      window.dispatchEvent(new CustomEvent(FRAME_EVENT,{detail:this._frame}));
    }
    _close() {
      this._open=null; this._detail=null; this._render();
      if (this._returnFocus) (this.shadowRoot.querySelector(`[data-focus="${this._returnFocus}"]`) || this._cardRoot.querySelector('[data-focus=page-switch]'))?.focus({preventScroll:true});
    }
    _keydown(event) {
      if (!this._open) {
        if (event.key==='Escape' && this._page==='daily') { event.preventDefault(); event.stopPropagation(); this._page='main'; this._render(); this._cardRoot.querySelector('[data-focus=page-switch]')?.focus({preventScroll:true}); }
        return;
      }
      if (event.key==='Escape') { event.preventDefault(); event.stopPropagation(); this._close(); return; }
      if (event.key!=='Tab') return;
      const focusable=[...this._dialog.querySelectorAll('button,input,select')];
      const first=focusable[0], last=focusable.at(-1);
      if (event.shiftKey && this.shadowRoot.activeElement===first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && this.shadowRoot.activeElement===last) { event.preventDefault(); first?.focus(); }
    }
  }

  class PogodaTehnikaEditor extends HTMLElement {
    constructor() {
      super(); this.attachShadow({mode:'open'});
      this.shadowRoot.addEventListener('change',event => {
        const field=event.target.dataset.key;
        if (!field) return;
        const value=event.target.type==='checkbox'?event.target.checked:event.target.type==='number'?Number(event.target.value):event.target.value;
        const next={...this._config,[field]:value};
        if (field==='hours' && (!Number.isInteger(value) || value<3 || value>8) || field==='days' && (!Number.isInteger(value) || value<3 || value>7)) { this._render(); return; }
        this._config=next;
        this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:next},bubbles:true,composed:true}));
      });
    }
    setConfig(config) { this._config={...config}; this._render(); }
    set hass(hass) {
      const signature=JSON.stringify(Object.entries(hass.states || {}).filter(([id])=>id.startsWith('weather.')).map(([id,state])=>[id,state.attributes.friendly_name]));
      this._hass=hass;
      if (signature!==this._signature) { this._signature=signature; this._render(); }
    }
    _render() {
      if(!this._config)return;
      const cfg={...DEFAULTS,...this._config};
      const entities=Object.keys(this._hass?.states || {}).filter(id=>id.startsWith('weather.'));
      if(cfg.entity&&!entities.includes(cfg.entity))entities.push(cfg.entity);
      const select=(key,label,options)=>`<label>${label}<select data-key="${key}">${options.map(([value,text])=>`<option value="${esc(value)}" ${cfg[key]===value?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`;
      this.shadowRoot.innerHTML=`<style>:host{display:block;font:14px/1.35 var(--paper-font-common-base_-_font-family,Roboto,system-ui,sans-serif);color:var(--primary-text-color);font-variant-numeric:tabular-nums}*{box-sizing:border-box}.form{display:grid;gap:14px}label{display:grid;gap:6px;font-size:13px}select,input[type=number]{font:inherit;padding:10px;width:100%;border:1px solid var(--divider-color);border-radius:8px;color:var(--primary-text-color);background:var(--card-background-color)}.check{display:flex;justify-content:space-between;align-items:center}.check input{width:20px;height:20px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}p{font-size:12px;color:var(--secondary-text-color);margin:0}</style><div class="form">${select('entity','Сутність погоди',[['','Автоматично'],...entities.map(id=>[id,`${this._hass?.states[id]?.attributes?.friendly_name || id} · ${id}`])])}<p>Заголовок картки — назва вибраної погодної сутності в Home Assistant. Перейменуйте сутність, щоб змінити населений пункт у заголовку.</p>${select('icon_style','Стиль значків',[['flat','Пласкі'],['soft','М’який об’єм'],['glass','Матове скло']])}<div class="two">${select('palette','Палітра',[['olive','Олива'],['graphite','Графіт']])}${select('mode','Оформлення',[['auto','Авто — тема HA'],['light','Світла'],['dark','Темна']])}</div><label>Кількість годин (3–8)<input type="number" min="3" max="8" step="1" data-key="hours" value="${cfg.hours}"></label>${[['show_hourly','Погодинний прогноз на головному екрані'],['show_precipitation','Ймовірність опадів у коротких показниках'],['show_daily','Екран прогнозу на 5 днів']].map(([key,label])=>`<label class="check">${label}<input type="checkbox" data-key="${key}" ${cfg[key]?'checked':''}></label>`).join('')}<p>Стрілка внизу перемикає два екрани однакового розміру. Палітра, оформлення й стиль значків тут — початкові значення. Особистий вибір та спільна рамка змінюються кнопкою «Т» і зберігаються у профілі HA. Час — Europe/Kyiv.</p></div>`;
    }
  }
  if (!customElements.get(`${TAG}-editor`)) customElements.define(`${TAG}-editor`,PogodaTehnikaEditor);
  if (!customElements.get(TAG)) customElements.define(TAG,PogodaTehnikaCard);
  window.customCards=window.customCards || [];
  if (!window.customCards.some(card=>card.type===TAG)) window.customCards.push({type:TAG,name:'Погода · ТЕХНіКА',description:'Компактна погода, два екрани та три стилі значків ТЕХНіКА.',preview:true});
})();
