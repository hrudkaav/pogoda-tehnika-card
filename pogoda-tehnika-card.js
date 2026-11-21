/* Погода · ТЕХНіКА | MIT
 * Install as a JavaScript module: /local/pogoda-tehnika-card.js
 * type: custom:pogoda-tehnika-card
 * entity: weather.forecast_home
 * No external dependencies. All dates and times use Europe/Kyiv.
 */
(() => {
  'use strict';
  const VERSION = "0.2.0";
  const TAG = 'pogoda-tehnika-card';
  const FRAME_KEY = 'tehnika-cards:frame';
  const FRAME_EVENT = 'tehnika-cards-frame';
  const PREF_EVENT = 'tehnika-weather-appearance';
  const TZ = 'Europe/Kyiv';
  const HOUR = 3600000;
  const DEFAULTS = { title: 'Погода', city: '', palette: 'olive', mode: 'auto', hours: 6, days: 5,
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
  function weatherIcon(condition, cls = '') {
    const name = ({'clear-night':'night',partlycloudy:'cloudy',rainy:'cloudy',pouring:'cloudy','snowy-rainy':'snow',snowy:'snow',hail:'snow','lightning-rainy':'lightning',windy:'wind','windy-variant':'wind',exceptional:'alert'})[condition] || condition;
    if (condition === 'partlycloudy') return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" transform="translate(9,-1) scale(.6)" d="${PATHS.sunny}"/><path fill="currentColor" transform="translate(0,8) scale(.72)" d="${PATHS.cloudy}"/></svg>`;
    if (condition === 'rainy' || condition === 'pouring') return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" transform="scale(1,.7)" d="${PATHS.cloudy}"/><path fill="currentColor" d="M7 16h2l-2 5H5l2-5zm5 0h2l-2 5h-2l2-5zm5 0h2l-2 5h-2l2-5z"/></svg>`;
    return icon(name, cls);
  }
  function forecastList(value) {
    return Array.isArray(value) ? value.filter(x => x && typeof x === 'object' && Number.isFinite(Date.parse(x.datetime)))
      .map(x => ({...x, time:Date.parse(x.datetime)})).sort((a,b) => a.time-b.time) : [];
  }
  function normalizeAppearance(value = {}) {
    return { ...(value.palette === 'olive' || value.palette === 'graphite' ? {palette:value.palette} : {}),
      ...(['auto','light','dark'].includes(value.mode) ? {mode:value.mode} : {}) };
  }
  function cleanPreferences(value) {
    if (!value || typeof value !== 'object') return null;
    return {version:1, appearance:normalizeAppearance(value.appearance), frame:value.frame === 'off' ? 'off' : 'on',
      updated_at:number(value.updated_at) ?? 0, pending:value.pending === true};
  }
  const CSS = `
    :host{display:block;container-type:inline-size;font:14px/1.35 var(--paper-font-common-base_-_font-family,Roboto,system-ui,sans-serif);font-variant-numeric:tabular-nums;color:var(--ink)}
    *,*::before,*::after{box-sizing:border-box}ha-card{display:block;background:var(--frame);border:1px solid var(--rim);border-radius:13px;padding:6px;color:var(--ink);box-shadow:none;overflow:visible}
    ha-card.frameless{background:var(--sf);padding:0;border-radius:17px}.screen{position:relative;background:var(--sf);border-radius:6px;padding:16px 14px;min-width:0}.frameless .screen{border-radius:16px}
    .header{display:flex;align-items:center;gap:10px;min-height:30px}.heading{display:flex;align-items:baseline;gap:10px;min-width:0;flex:1}h2{font-size:18px;font-weight:500;margin:0;white-space:nowrap}.city{font-size:12px;color:var(--quiet);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    button,select,input{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}.icon{width:22px;height:22px;display:block;flex:none}.icon-button{width:30px;height:30px;display:grid;place-items:center;border:1px solid transparent;border-radius:8px;color:var(--quiet);background:transparent;padding:3px;flex:none}.icon-button .icon{width:20px;height:20px}.icon-button:hover,.icon-button[aria-expanded=true]{background:var(--fc);border-color:var(--edge)}
    button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--live);outline-offset:3px}
    .strip{height:36px;margin-top:12px;padding:0 10px;background:var(--fc);border-radius:8px;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--quiet);white-space:nowrap;overflow:hidden}.strip strong{font-size:16px;font-weight:500;color:var(--fcink)}.strip-right{margin-left:auto;font-size:12px;overflow:hidden;text-overflow:ellipsis}
    .current{width:100%;display:flex;align-items:center;gap:14px;padding:17px 0 15px;border:0;border-bottom:1px solid var(--edge);background:transparent;text-align:left;min-height:114px}.hero-icon{width:54px;height:54px;color:var(--live)}.temperature{display:flex;align-items:flex-start;letter-spacing:-2px;font-size:56px;line-height:1.1;font-weight:500;white-space:nowrap}.unit{font-size:19px;letter-spacing:0;margin:7px 0 0 4px;font-weight:400;color:var(--quiet)}.condition{font-size:13px;color:var(--quiet);margin-top:5px;letter-spacing:0;max-width:220px}.now-meta{margin-left:auto;text-align:right;align-self:center;font-size:12px;color:var(--quiet);line-height:1.7}.now-meta b{font-weight:500;color:var(--ink)}
    .metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px 0 0}.metric{min-width:0}.metric-label{display:flex;align-items:center;gap:4px;color:var(--quiet);font-size:11px;white-space:nowrap}.metric-label .icon{width:14px;height:14px}.metric-value{margin-top:4px;font-size:15px;font-weight:500;white-space:nowrap}.metric-unit{font-size:11px;color:var(--quiet);font-weight:400}
    h3{font-size:13px;font-weight:500;margin:16px 0 10px}.section-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.section-head span{font-size:10px;color:var(--quiet)}.hours{display:grid;grid-template-columns:repeat(var(--count),minmax(0,1fr));gap:4px}.hour{border:1px solid transparent;border-radius:8px;background:transparent;min-width:0;padding:6px 1px;display:flex;flex-direction:column;align-items:center;gap:7px}.hour:hover,.day:hover{background:var(--fc);border-color:var(--edge)}.hour-time{font-size:10px;color:var(--quiet)}.hour:first-child .hour-time{font-size:13px;font-weight:500;color:var(--ink)}.hour .icon{width:23px;height:23px;color:var(--quiet)}.hour-temp{font-size:15px;font-weight:500}.hour-rain{font-size:10px;color:var(--quiet);white-space:nowrap}
    .rain-section h3{margin-bottom:34px}.timeline-wrap{position:relative}.timeline{height:22px;display:flex;border-radius:6px;box-shadow:0 0 0 1px var(--ring);overflow:hidden;background:var(--off)}.rain-slot{display:block;position:relative;flex:1;min-width:0;border:0;border-right:1px solid var(--tick);padding:0;background:var(--off)}.rain-slot:last-child{border-right:0}.rain-fill{position:absolute;inset:0;background:var(--live)}.rain-slot.possible .rain-fill{background:var(--stripe)}.rain-slot.missing{background:var(--fc)}.rain-slot.missing::before{content:'·';position:absolute;inset:0;text-align:center;color:var(--quiet);font-size:12px;line-height:22px}.rain-slot.past::after{content:'';position:absolute;inset:0;background:var(--past)}.rain-slot:hover{box-shadow:inset 0 0 0 2px var(--ink);z-index:1}.elapsed{position:absolute;left:0;top:0;height:22px;border-radius:6px 0 0 6px;background:var(--past);pointer-events:none;z-index:1}.marker{position:absolute;top:0;height:22px;width:3px;background:#fff;transform:translateX(-50%);pointer-events:none;z-index:2}.marker span{position:absolute;bottom:28px;left:50%;transform:translateX(-25%);border-radius:6px;background:var(--nowbg);color:var(--nowink);font-size:12px;font-weight:500;padding:2px 5px;white-space:nowrap}.hour-axis{display:flex;justify-content:space-between;color:var(--quiet);font-size:10px;margin-top:6px;align-items:baseline}.hour-axis .major{font-size:13px;font-weight:500;color:var(--ink)}.legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;color:var(--quiet);font-size:10px}.key{display:inline-block;width:10px;height:7px;border-radius:2px;margin-right:4px;background:var(--live)}.key.possible{background:var(--stripe)}.key.missing{background:var(--fc);box-shadow:0 0 0 1px var(--ring)}.key.dry{background:var(--off);box-shadow:0 0 0 1px var(--ring)}
    .days{display:flex;flex-direction:column;gap:2px}.day{display:grid;grid-template-columns:64px 24px 37px minmax(35px,1fr) 37px;gap:8px;align-items:center;min-height:35px;padding:4px 3px;border:1px solid transparent;border-radius:6px;text-align:left;background:transparent}.day-name{font-size:12px}.day-name small{font-size:10px;color:var(--quiet);display:block}.day .icon{width:20px;height:20px;color:var(--quiet)}.day-low{font-size:12px;color:var(--quiet);text-align:right}.day-high{font-size:13px;font-weight:500;text-align:right}.day-range{position:relative;height:22px;background:var(--off);border-radius:6px;box-shadow:0 0 0 1px var(--ring);overflow:hidden}.day-range span{position:absolute;top:0;bottom:0;border-radius:6px;background:var(--live)}
    .footer{margin-top:14px;padding-top:10px;border-top:1px solid var(--edge);display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:10px;color:var(--quiet)}.brand{font-size:10px;font-weight:500;letter-spacing:1.4px}.updated{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.empty{font-size:12px;color:var(--quiet);padding:10px 0;min-height:36px}.warning{color:var(--warn);background:var(--warnbg);border:1px solid var(--warnline);padding:9px 10px;border-radius:8px;font-size:12px;margin-top:12px}
    .shade{position:absolute;inset:0;border-radius:inherit;background:transparent;z-index:9}.popover{position:absolute;top:52px;right:10px;left:10px;max-width:340px;margin-left:auto;max-height:calc(100% - 62px);overflow:auto;overscroll-behavior:contain;z-index:10;border:1px solid var(--edge);border-radius:10px;background:var(--popbg);box-shadow:var(--popshadow);padding:12px}.pop-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:5px}.pop-title{font-size:14px;font-weight:500}.pop-head .icon-button{width:26px;height:26px}.field-label{display:block;font-size:12px;color:var(--quiet);margin:12px 0 7px}.segments{display:flex;gap:4px}.segments button{flex:1;border:1px solid var(--edge);border-radius:7px;padding:7px 5px;font-size:12px;color:var(--quiet);background:var(--fc)}.segments button[aria-pressed=true]{color:var(--onlive);background:var(--live);border-color:var(--live);font-weight:500}.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px;margin-top:16px}.toggle-row input{width:18px;height:18px;accent-color:var(--live)}.hint{color:var(--quiet);font-size:11px;margin:8px 0}.save-status{color:var(--quiet);font-size:11px;min-height:30px;margin-top:12px;padding-top:9px;border-top:1px solid var(--edge)}.detail-weather{display:flex;align-items:center;gap:10px;margin:10px 0 14px}.detail-weather .icon{color:var(--live);width:36px;height:36px}.detail-weather strong{font-size:27px;font-weight:500}.detail-description{color:var(--quiet);font-size:12px}.detail-row{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--edge);font-size:12px}.detail-row span:first-child{color:var(--quiet)}.detail-row span:last-child{text-align:right}
    .heading h2{min-width:0;overflow:hidden;text-overflow:ellipsis}.current.compact-current{border:0;min-height:100px;padding:14px 0 12px;gap:12px}.compact-extrema{margin-left:auto;flex:none;background:var(--fc);border-radius:8px;padding:6px 8px;font-size:12px;line-height:1.7}.compact-extrema small{display:block;color:var(--quiet);font-size:10px}.compact-extrema div{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.compact-extrema span{color:var(--quiet);font-size:10px}.compact-extrema b{color:var(--fcink);font-weight:500;white-space:nowrap}
    .compact-facts{display:flex;align-items:center;gap:18px;min-height:21px;flex-wrap:wrap}.compact-fact{display:flex;align-items:center;gap:5px;font-size:13px}.compact-fact .icon{color:var(--quiet);height:16px;width:16px}.fact-label,.fact-unit{color:var(--quiet);font-size:11px}.fact-value{font-weight:500}.compact-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;padding-top:9px;border-top:1px solid var(--edge)}.compact-stamp{min-width:0;display:flex;flex-direction:column;gap:3px;color:var(--quiet);font-size:10px}.details-button{display:flex;align-items:center;justify-content:center;gap:5px;flex:none;background:var(--fc);border:1px solid var(--edge);border-radius:8px;padding:6px 9px;min-height:32px;font-size:12px;font-weight:500;color:var(--ink)}.details-button:hover{border-color:var(--quiet)}.details-button .icon{width:18px;height:18px;color:var(--quiet)}
    .weather-dialog{position:fixed;inset:0;margin:auto;width:620px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);padding:6px;border:1px solid var(--rim);border-radius:13px;color:var(--ink);background:var(--frame);box-shadow:var(--popshadow);font:inherit;font-variant-numeric:tabular-nums;overflow:hidden;overscroll-behavior:contain}.weather-dialog:not([open]){display:none}.weather-dialog::backdrop{background:var(--dialogbackdrop);touch-action:none}.weather-dialog.settings-dialog{width:360px}.weather-dialog.frameless{padding:0;background:var(--sf);border-radius:17px}.dialog-inner{container-type:inline-size;min-width:0;background:var(--sf);border-radius:6px;overflow:hidden}.frameless .dialog-inner{border-radius:16px}.dialog-head{display:flex;align-items:center;gap:9px;padding:14px;border-bottom:1px solid var(--edge);min-width:0}.dialog-heading{min-width:0;flex:1}.dialog-heading h2{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dialog-city{font-size:12px;color:var(--quiet);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dialog-scroll{padding:0 14px 14px;max-height:calc(100dvh - 112px);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--ring) var(--sf)}.dialog-scroll[data-view=settings]{padding-top:1px}.dialog-scroll[data-view=detail]{padding-top:6px;min-height:min(300px,55dvh)}.dialog-current{display:flex;align-items:center;gap:12px;padding:14px 0 12px}.dialog-current .hero-icon{width:40px;height:40px}.dialog-current strong{font-size:32px;font-weight:500;line-height:1.1}.dialog-current p{font-size:12px;color:var(--quiet);margin:4px 0 0}.dialog-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}.dialog-metrics .detail-row{font-size:12px;min-width:0}.dialog-scroll .hours{gap:7px}.dialog-scroll .empty{padding:8px 0;min-height:0}.dialog-status{margin-top:14px;color:var(--quiet);font-size:11px}.dialog-attribution{font-size:10px;color:var(--quiet);margin:12px 0 0}.detail-weather small{font-size:14px;color:var(--quiet);font-weight:400}.settings-dialog .field-label:first-child{margin-top:12px}
    @container(max-width:359px){.secondary{display:none!important}.heading{gap:7px}.city{font-size:11px;max-width:125px}.current{gap:10px}.hero-icon{width:43px;height:43px}.temperature{font-size:48px}.unit{font-size:16px}.metrics{gap:6px}.metric-value{font-size:14px}.metric-label{font-size:10px}.metric-unit{font-size:10px}.day{grid-template-columns:54px 20px 31px minmax(24px,1fr) 31px;gap:6px}.hour-temp{font-size:14px}.condition{font-size:12px;max-width:190px}.compact-facts{gap:13px}.compact-extrema{padding:5px 7px}.compact-current .condition{max-width:155px}.dialog-metrics{grid-template-columns:minmax(0,1fr)}.dialog-scroll .hours{gap:2px}}
    @container(max-width:269px){.screen{padding:12px 10px}.city{display:none}.hero-icon{width:35px;height:35px}.temperature{font-size:42px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metric:last-child{display:none}.hour-rain{font-size:9px}.day{gap:4px;grid-template-columns:45px 17px 28px minmax(16px,1fr) 28px}.legend{gap:7px}.brand{letter-spacing:.7px}.compact-current{gap:8px!important}.compact-current .condition{max-width:118px}.compact-extrema{padding:4px 5px}.compact-extrema div{gap:5px}.compact-extrema small{display:none}.compact-facts{gap:9px}.details-button{padding:6px}.dialog-metrics{grid-template-columns:minmax(0,1fr)}}
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
      this._forecasts = {}; this._subscriptions = []; this._forecastEpoch = 0;
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
      for (const key of ['show_hourly','show_daily','show_precipitation']) if (config[key] !== undefined && typeof config[key] !== 'boolean') throw new Error(`${key}: потрібне значення true або false`);
      for (const [key,min,max] of [['hours',3,8],['days',3,7]]) if (config[key] !== undefined && (!Number.isInteger(config[key]) || config[key]<min || config[key]>max)) throw new Error(`${key}: ціле число від ${min} до ${max}`);
      this._config = {...DEFAULTS,...config};
      this._open = null; this._detail = null; this._forecastScroll = 0;
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
      return {...base[dark?'dark':'light'], frame:base.frame,rim:base.rim,
        live:dark?'#ffcc1f':'#ffc20e',fcink:dark?'#ffcc1f':'#6b4f00',onlive:'#3a2f0a',
        stripe:`repeating-linear-gradient(135deg, ${dark?'#ffcc1f':'#ffc20e'} 0 2.5px, ${dark?'#b08a14':'#b08300'} 2.5px 5px)`,
        warn:dark?'#ff8a50':'#c2410c',warnbg:dark?'rgba(255,138,80,.14)':'rgba(234,88,12,.12)',warnline:dark?'rgba(255,138,80,.45)':'rgba(194,65,12,.45)',
        popshadow:`0 10px 28px rgba(0,0,0,${dark?'.45':'.2'})`,tick:dark?'rgba(255,255,255,.22)':'rgba(0,0,0,.42)',
        past:dark?'rgba(0,0,0,.45)':'rgba(255,255,255,.45)',nowbg:dark?'#f5f5f0':'#2a2f33',nowink:dark?'#2a2f33':'#fff',
        dialogbackdrop:dark?'rgba(0,0,0,.45)':'rgba(0,0,0,.2)'};
    }
    _days() {
      const today = dayKey(Date.now());
      return (this._forecasts.daily || this._forecasts.twice_daily || []).filter(x => dayKey(x.time) >= today).slice(0,this._config.days);
    }
    _temperature(value) { return `${signed(value)}${number(value) === null ? '' : '°'}`; }
    _precipitation(value) {
      if (percent(value.precipitation_probability) !== null) return `${fmt(percent(value.precipitation_probability))}%`;
      if (number(value.precipitation) !== null) return `${fmt(value.precipitation,1)} ${esc(this._state()?.attributes?.precipitation_unit || '')}`.trim();
      return '—';
    }
    _forecastEmpty(type) {
      const features = Number(this._state()?.attributes?.supported_features || 0);
      const supported = type === 'hourly' ? features & 2 : features & 5;
      const error = this._forecastErrors?.[type] || type === 'daily' && this._forecastErrors?.twice_daily || this._forecastErrors?.connection;
      return `<div class="empty">${error ? 'Не вдалося отримати прогноз. Повторюємо підключення…' : !supported ? 'Джерело не надає цей прогноз.' : this._forecasts[type] || type === 'daily' && this._forecasts.twice_daily ? 'Джерело поки не має прогнозу.' : 'Завантаження прогнозу…'}</div>`;
    }
    _render() {
      if (!this._config) return;
      const focusKey = this.shadowRoot.activeElement?.dataset.focus;
      for (const [key,value] of Object.entries(this._colors())) this.style.setProperty(`--${key}`,value);
      const state = this._state();
      const available = !!state && !['unavailable','unknown'].includes(state.state);
      const attr = available ? state.attributes || {} : {};
      const condition = available ? state.state : state?.state || 'unknown';
      const today = (this._forecasts.daily || []).find(x => dayKey(x.time) === dayKey(Date.now()));
      const extrema = today && (number(today.templow) !== null || number(today.temperature) !== null)
        ? `<div class="compact-extrema"><small>Сьогодні</small>${number(today.templow) !== null ? `<div><span>мін.</span><b>${this._temperature(today.templow)}</b></div>` : ''}${number(today.temperature) !== null ? `<div><span>макс.</span><b>${this._temperature(today.temperature)}</b></div>` : ''}</div>` : '';
      const city = this._config.city || state?.attributes?.friendly_name || '';
      const time = state?.last_updated && Number.isFinite(Date.parse(state.last_updated)) ? dateFmt(state.last_updated,{hour:'2-digit',minute:'2-digit'}) : '—';
      const fact = (name,label,value,unit) => `<span class="compact-fact">${icon(name)}<span class="fact-label secondary">${label}</span><span class="fact-value">${fmt(value,1)}</span>${unit ? `<span class="fact-unit">${esc(unit)}</span>` : ''}</span>`;
      const facts = [number(attr.wind_speed) !== null ? fact('wind','Вітер',attr.wind_speed,this._windUnit()) : '',number(attr.humidity) !== null ? fact('water','Вологість',attr.humidity,'%') : ''].join('');
      this._cardRoot.innerHTML = `<ha-card class="${this._frame === 'off'?'frameless':''}"><div class="screen">
        <header class="header"><div class="heading"><h2>${esc(this._config.title || 'Погода')}</h2><span class="city" title="${esc(city)}">${esc(city)}</span></div><button class="icon-button" data-action="settings" data-focus="settings" aria-label="Налаштування вигляду" aria-haspopup="dialog" aria-expanded="${this._open === 'settings'}">${icon('settings')}</button></header>
        <button class="current compact-current" data-action="forecast" data-focus="current" aria-label="Відкрити детальний прогноз погоди" aria-haspopup="dialog" aria-expanded="${!!this._open && this._open !== 'settings'}">${weatherIcon(condition,'hero-icon')}<div><div class="temperature">${signed(attr.temperature)}<span class="unit">${esc(attr.temperature_unit || '°C')}</span></div><div class="condition">${esc(CONDITIONS[condition] || 'Погодні дані')}</div></div>${extrema}</button>
        ${facts ? `<div class="compact-facts">${facts}</div>` : ''}
        ${this._weatherWarning(available,condition)}
        <footer class="compact-footer"><div class="compact-stamp"><span class="brand">ТЕХНіКА</span><span>Дані: ${esc(time)}</span></div><button class="details-button" data-action="forecast" data-focus="forecast" aria-label="Детальніше про погоду" aria-haspopup="dialog" aria-expanded="${!!this._open && this._open !== 'settings'}">Детальніше${icon('expand')}</button></footer>
      </div></ha-card>`;
      this._renderDialog(attr,condition,city,available,time);
      if (focusKey) this.shadowRoot.querySelector(`[data-focus="${focusKey}"]`)?.focus({preventScroll:true});
    }
    _windUnit() {
      const unit = this._state()?.attributes?.wind_speed_unit || '';
      return ({'km/h':'км/год','m/s':'м/с','mph':'миль/год','kn':'вузл.'})[unit] || unit;
    }
    _weatherWarning(available,condition) {
      if (!available) return `<div class="warning" role="status">${!this._entity() ? 'Додайте інтеграцію погоди або оберіть сутність weather.* у редакторі.' : !this._state() ? 'Сутність погоди не знайдено. Перевірте її у редакторі.' : 'Джерело погоди зараз недоступне.'}</div>`;
      return condition === 'exceptional' ? '<div class="warning" role="status">Джерело повідомляє про незвичайні погодні умови.</div>' : '';
    }
    _dataRows(entry,forecast = false) {
      const attr = this._state()?.attributes || {};
      const fields = [
        ['Відчувається як',entry.apparent_temperature,attr.temperature_unit || '°C'],
        ['Вітер',entry.wind_speed,this._windUnit()],
        ['Вологість',entry.humidity,'%'],
        ['Тиск',entry.pressure,attr.pressure_unit || ''],
        ...(forecast ? [['Ймовірність опадів',percent(entry.precipitation_probability),'%'],['Кількість опадів',entry.precipitation,attr.precipitation_unit || ''],['Мінімальна температура',entry.templow,attr.temperature_unit || '°C']] : [])
      ];
      return fields.filter(([,value]) => number(value) !== null).map(([label,value,unit]) => `<div class="detail-row"><span>${label}</span><span>${fmt(value,1)}${unit ? ` ${esc(unit)}` : ''}</span></div>`).join('');
    }
    _forecastStatus() {
      const enabled = [this._config.show_hourly || this._config.show_precipitation,this._config.show_daily].some(Boolean);
      const pending = enabled && !Object.keys(this._forecasts).length && !Object.keys(this._forecastErrors || {}).length && !!Number(this._state()?.attributes?.supported_features || 0);
      const failed = Object.keys(this._forecastErrors || {}).length > 0;
      if (failed) return '<p class="dialog-status" role="status">Прогноз тимчасово недоступний. Повторюємо підключення…</p>';
      if (pending) return '<p class="dialog-status" role="status">Завантаження прогнозу…</p>';
      return `<p class="dialog-status">${enabled ? 'Джерело поки не надало даних прогнозу.' : 'Показ прогнозів вимкнено в редакторі картки.'}</p>`;
    }
    _renderDialog(attr,condition,city,available,time) {
      const dialog = this._dialog;
      if (!this._open) {
        if (dialog.open) dialog.close();
        dialog.innerHTML = '';
        return;
      }
      const previousView = dialog.dataset.view;
      const scroll = dialog.querySelector('.dialog-scroll')?.scrollTop || 0;
      if (previousView === 'forecast') this._forecastScroll = scroll;
      const settings = this._open === 'settings';
      const detail = this._open === 'detail';
      const entry = this._detail?.entry || {};
      const title = settings ? 'Вигляд картки' : detail && this._detail ? dateFmt(this._detail.time,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Погода · детальніше';
      let content;
      if (settings) content = this._settingsContent();
      else if (detail) content = this._detailContent(entry);
      else {
        const forecasts = [this._config.show_hourly ? this._renderHourly() : '',this._config.show_precipitation ? this._renderRain() : '',this._config.show_daily ? this._renderDaily() : ''].join('');
        content = `<div class="dialog-current">${weatherIcon(condition,'hero-icon')}<div><strong>${signed(attr.temperature)} <span class="metric-unit">${esc(attr.temperature_unit || '°C')}</span></strong><p>${esc(CONDITIONS[condition] || 'Погодні дані')}</p></div></div><div class="dialog-metrics">${this._dataRows(attr)}</div>${this._weatherWarning(available,condition)}${forecasts || this._forecastStatus()}<p class="dialog-attribution">Дані: ${esc(time)} · Київський час${this._state()?.attributes?.attribution ? ` · ${esc(this._state().attributes.attribution)}` : ''}</p>`;
      }
      dialog.className = `weather-dialog ${settings ? 'settings-dialog' : ''} ${this._frame === 'off' ? 'frameless' : ''}`;
      dialog.dataset.view = this._open;
      dialog.innerHTML = `<div class="dialog-inner"><header class="dialog-head">${detail ? `<button class="icon-button" data-action="back" data-focus="back" aria-label="Назад до прогнозу">${icon('back')}</button>` : ''}<div class="dialog-heading"><h2 id="weather-dialog-title">${esc(title)}</h2>${!settings && city ? `<div class="dialog-city">${esc(city)}</div>` : ''}</div><button class="icon-button" data-action="close" data-focus="close" aria-label="Закрити">${icon('close')}</button></header><div class="dialog-scroll" data-view="${this._open}">${content}</div></div>`;
      if (!dialog.open && this.isConnected) dialog.showModal();
      const scroller = dialog.querySelector('.dialog-scroll');
      if (scroller) scroller.scrollTop = previousView === this._open ? scroll : this._open === 'forecast' ? this._forecastScroll || 0 : 0;
    }
    _renderHourly() {
      const list = (this._forecasts.hourly || []).filter(x => x.time+HOUR>Date.now()).slice(0,this._config.hours);
      if (!list.length) return '';
      return `<section><div class="section-head"><h3>Найближчі години</h3><span class="secondary">Температура · опади</span></div><div class="hours" style="--count:${list.length}">${list.map((x,i) => `<button class="hour" data-action="hour" data-index="${i}" data-focus="hour-${i}" aria-label="Прогноз на ${esc(dateFmt(x.time,{hour:'2-digit',minute:'2-digit'}))}" aria-haspopup="dialog"><span class="hour-time">${dateFmt(x.time,{hour:'2-digit',minute:'2-digit'})}</span>${weatherIcon(x.condition)}<span class="hour-temp">${this._temperature(x.temperature)}</span>${this._precipitation(x) !== '—' ? `<span class="hour-rain">${this._precipitation(x)}</span>` : ''}</button>`).join('')}</div></section>`;
    }
    _rainSlots() {
      const now = Date.now();
      // A fixed 24-hour elapsed-time window follows the current hour. This also handles
      // Kyiv's 23/25-hour DST days without fabricating or duplicating forecast periods.
      const start = Math.floor(now/HOUR)*HOUR;
      const list = this._forecasts.hourly || [];
      return Array.from({length:24},(_,i) => {
        const time = start+i*HOUR;
        const found = list.find(x => Math.abs(x.time-time)<60000);
        return {time,entry:found,probability:found ? percent(found.precipitation_probability) : null};
      });
    }
    _renderRain() {
      const slots = this._rainSlots();
      const marker = ((Date.now()-slots[0].time)/HOUR/24)*100;
      const anyData = slots.some(x => x.probability !== null);
      if (!anyData) return '';
      return `<section class="rain-section"><div class="section-head"><h3>Ймовірність опадів · 24 год</h3><span class="secondary">0–100%</span></div><div class="timeline-wrap"><div class="timeline" aria-label="Погодинна ймовірність опадів">${slots.map((x,i) => `<button class="rain-slot ${x.probability === null ? 'missing' : x.probability>0 && x.probability<70 ? 'possible' : ''} ${x.time+HOUR<=Date.now()?'past':''}" data-action="rain" data-index="${i}" data-focus="rain-${i}" aria-label="${esc(dateFmt(x.time,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}: ${x.probability === null ? 'немає даних' : `${fmt(x.probability)}%`}" aria-haspopup="dialog" title="${esc(dateFmt(x.time,{hour:'2-digit',minute:'2-digit'}))}: ${x.probability === null ? 'немає даних' : `${fmt(x.probability)}%`}">${x.probability !== null ? `<span class="rain-fill" style="opacity:${x.probability>0 ? .25+x.probability*.0075 : 0}"></span>` : ''}</button>`).join('')}</div><div class="elapsed" style="width:${marker}%"></div><div class="marker" style="left:${marker}%"><span>${dateFmt(Date.now(),{hour:'2-digit',minute:'2-digit'})}</span></div></div><div class="hour-axis">${[0,6,12,18,24].map(i=>`<span class="${localHour(slots[0].time+i*HOUR) % 12 === 0?'major':''}">${dateFmt(slots[0].time+i*HOUR,{hour:'2-digit',hourCycle:'h23'})}</span>`).join('')}</div><div class="legend"><span><i class="key dry"></i>0%</span><span><i class="key"></i>70–100%</span><span><i class="key possible"></i>1–69%</span><span><i class="key missing"></i>Немає даних</span></div>${!anyData ? '<div class="empty">Немає погодинних даних про ймовірність опадів.</div>' : ''}</section>`;
    }
    _renderDaily() {
      const list = this._days();
      if (!list.length) return '';
      const temperatures = list.flatMap(x=>[number(x.templow),number(x.temperature)]).filter(x=>x!==null);
      const min = temperatures.length?Math.min(...temperatures):0, max = temperatures.length?Math.max(...temperatures):1;
      const span = Math.max(1,max-min);
      const twice = !this._forecasts.daily && !!this._forecasts.twice_daily;
      return `<section><div class="section-head"><h3>${twice?'День і ніч':'Найближчі дні'}</h3><span class="secondary">${twice?'Прогноз за період':'Мін. / макс.'}</span></div>${list.length ? `<div class="days">${list.map((x,i) => {
        const low=number(x.templow), high=number(x.temperature);
        const left=low===null?0:(low-min)/span*100, width=low===null || high===null?0:Math.max(3,(high-low)/span*100);
        return `<button class="day" data-action="day" data-index="${i}" data-focus="day-${i}" aria-label="Прогноз: ${esc(dateFmt(x.time,{weekday:'long',day:'numeric',month:'long'}))}${twice ? x.is_daytime ? ', день' : ', ніч' : ''}" aria-haspopup="dialog"><span class="day-name">${dayKey(x.time)===dayKey(Date.now())?'Сьогодні':dateFmt(x.time,{weekday:'short'})}<small>${twice ? x.is_daytime?'День':'Ніч' : dateFmt(x.time,{day:'numeric',month:'2-digit'})}</small></span>${weatherIcon(x.condition)}<span class="day-low">${number(x.templow) === null ? '' : this._temperature(x.templow)}</span><span class="day-range" ${low === null || high === null ? 'style="visibility:hidden"' : ''}><span style="left:${left}%;width:${Math.min(width,100-left)}%"></span></span><span class="day-high">${number(x.temperature) === null ? '' : this._temperature(x.temperature)}</span></button>`;
      }).join('')}</div>` : this._forecastEmpty('daily')}</section>`;
    }
    _settingsContent() {
      const segment = (key,label,options,current) => `<span class="field-label">${label}</span><div class="segments" role="group" aria-label="${label}">${options.map(([value,text])=>`<button data-action="appearance" data-key="${key}" data-value="${value}" data-focus="${key}-${value}" aria-pressed="${current===value}">${text}</button>`).join('')}</div>`;
      return `${segment('palette','Палітра',[['olive','Олива'],['graphite','Графіт']],this._appearance.palette || this._config.palette)}${segment('mode','Оформлення',[['auto','Авто'],['light','Світла'],['dark','Темна']],this._appearance.mode || this._config.mode)}<label class="toggle-row" for="frame-toggle">Рамка<input id="frame-toggle" data-action="frame" data-focus="frame" type="checkbox" ${this._frame==='on'?'checked':''}></label><p class="hint">Спільна для всіх карток ТЕХНіКА на цьому пристрої.</p><div class="save-status" role="status">${({loading:'Завантажуємо ваші налаштування…',saving:'Зберігаємо в профілі HA…',saved:'Вигляд збережено у вашому профілі HA.',local:'Збережено на пристрої. Профіль HA поки недоступний.'})[this._profileStatus] || 'Налаштування вигляду для вашого профілю HA.'}</div>`;
    }
    _detailContent(entry) {
      const unit = esc(this._state()?.attributes?.temperature_unit || '°C');
      const rows = this._dataRows(entry,true);
      if (number(entry.temperature) === null && !entry.condition && !rows) return '<p class="dialog-status">Для цього періоду немає даних прогнозу.</p>';
      return `<div class="detail-weather">${weatherIcon(entry.condition)}<div>${number(entry.temperature) !== null ? `<strong>${signed(entry.temperature)} <small>${unit}</small></strong>` : ''}${entry.condition ? `<div class="detail-description">${esc(CONDITIONS[entry.condition] || 'Погодні дані')}</div>` : ''}</div></div>${rows}<p class="hint">Прогноз джерела погоди · Київський час</p>`;
    }
    _click(event) {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action==='frame') return;
      if (action==='appearance') {
        this._appearance[button.dataset.key]=button.dataset.value; this._persistPreferences(); this._render(); return;
      }
      if (action==='close') { this._close(); return; }
      if (action==='back') {
        this._open='forecast'; this._detail=null; this._render();
        if (this._detailReturnFocus) this._dialog.querySelector(`[data-focus="${this._detailReturnFocus}"]`)?.focus({preventScroll:true});
        return;
      }
      if (!this._open) this._returnFocus = button.dataset.focus;
      if (action==='settings' || action==='forecast') {
        this._open=action; this._detail=null; this._forecastScroll=0;
      } else if (['hour','day','rain'].includes(action)) {
        const i=Number(button.dataset.index);
        const entry=action==='day'?this._days()[i]:action==='rain'?this._rainSlots()[i]?.entry:(this._forecasts.hourly || []).filter(x=>x.time+HOUR>Date.now()).slice(0,this._config.hours)[i];
        const time=entry?.time || (action==='rain'?this._rainSlots()[i]?.time:Date.now());
        this._detailReturnFocus=button.dataset.focus;
        this._open='detail'; this._detail={entry:entry || {},time};
      } else return;
      this._render(); this._dialog.querySelector('[data-action=close]')?.focus({preventScroll:true});
    }
    _change(event) {
      if (event.target.dataset.action!=='frame') return;
      this._frame=event.target.checked?'on':'off'; writeCache(FRAME_KEY,this._frame);
      window.dispatchEvent(new CustomEvent(FRAME_EVENT,{detail:this._frame}));
    }
    _close() {
      this._open=null; this._detail=null; this._render();
      if (this._returnFocus) this.shadowRoot.querySelector(`[data-focus="${this._returnFocus}"]`)?.focus({preventScroll:true});
    }
    _keydown(event) {
      if (!this._open) return;
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
      if (!this._config) return;
      const cfg={...DEFAULTS,...this._config};
      const entities=Object.keys(this._hass?.states || {}).filter(id=>id.startsWith('weather.'));
      if (cfg.entity && !entities.includes(cfg.entity)) entities.push(cfg.entity);
      const select=(key,label,options) => `<label>${label}<select data-key="${key}">${options.map(([value,text])=>`<option value="${esc(value)}" ${cfg[key]===value?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`;
      this.shadowRoot.innerHTML=`<style>:host{display:block;font:14px/1.35 var(--paper-font-common-base_-_font-family,Roboto,system-ui,sans-serif);color:var(--primary-text-color);font-variant-numeric:tabular-nums}*{box-sizing:border-box}.form{display:grid;gap:14px}label{display:grid;gap:6px;font-size:13px}select,input[type=text],input[type=number]{font:inherit;padding:10px;width:100%;border:1px solid var(--divider-color);border-radius:8px;color:var(--primary-text-color);background:var(--card-background-color)}.check{display:flex;justify-content:space-between;align-items:center}.check input{width:20px;height:20px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}p{font-size:12px;color:var(--secondary-text-color);margin:0}</style><div class="form">${select('entity','Сутність погоди',[['','Автоматично'],...entities.map(id=>[id,`${this._hass?.states[id]?.attributes?.friendly_name || id} · ${id}`])])}<label>Заголовок<input type="text" data-key="title" value="${esc(cfg.title)}"></label><label>Місто / місце<input type="text" data-key="city" placeholder="Назва сутності, якщо порожньо" value="${esc(cfg.city)}"></label><div class="two">${select('palette','Палітра',[['olive','Олива'],['graphite','Графіт']])}${select('mode','Оформлення',[['auto','Авто — тема HA'],['light','Світла'],['dark','Темна']])}</div><div class="two"><label>Кількість годин (3–8)<input type="number" min="3" max="8" step="1" data-key="hours" value="${cfg.hours}"></label><label>Дні / періоди (3–7)<input type="number" min="3" max="7" step="1" data-key="days" value="${cfg.days}"></label></div>${[['show_hourly','Погодинний прогноз'],['show_precipitation','Шкала ймовірності опадів'],['show_daily','Добовий прогноз']].map(([key,label])=>`<label class="check">${label}<input type="checkbox" data-key="${key}" ${cfg[key]?'checked':''}></label>`).join('')}<p>Погодинний і добовий прогнози та шкала опадів відкриваються кнопкою «Детальніше». Палітра й оформлення тут — початкові значення. Особистий вигляд і спільна рамка змінюються через шестерню на картці та зберігаються у профілі HA. Усі дати й години — Europe/Kyiv.</p></div>`;
    }
  }
  if (!customElements.get(`${TAG}-editor`)) customElements.define(`${TAG}-editor`,PogodaTehnikaEditor);
  if (!customElements.get(TAG)) customElements.define(TAG,PogodaTehnikaCard);
  window.customCards=window.customCards || [];
  if (!window.customCards.some(card=>card.type===TAG)) window.customCards.push({type:TAG,name:'Погода · ТЕХНіКА',description:'Погода, погодинний і добовий прогнози в корпусі ТЕХНіКА.',preview:true});
})();
