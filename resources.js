'use strict';

// Shared collection data lives in resources.json; filters remain visitor-local.
const FORMATS = {
  book: {label:'Book', category:'Books', action:'Explore the book'},
  channel: {label:'YouTube channel', category:'YouTube channels', action:'Visit the channel'},
  tv: {label:'TV series', category:'TV series', action:'About the series'},
  poetry: {label:'Poetry', category:'Poetry', action:'Read the collection'},
  community: {label:'Organization / community', category:'Organizations & communities', action:'Visit the website'},
  article: {label:'Article', category:'Articles', action:'Read the article'},
  game: {label:'Game', category:'Games', action:'Play the game'},
  film: {label:'Film', category:'Films', action:'Explore the film'},
  video: {label:'Video', category:'Videos', action:'Watch the video'},
  podcast: {label:'Podcast', category:'Podcasts', action:'Listen to the podcast'},
  other: {label:'Other find', category:'Other finds', action:'Explore the resource'}
};
const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function safeURL(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
function validateResource(item){
  return item && typeof item.id==='string' && item.id.length>0 && typeof item.title==='string' && item.title.trim().length>0 && Object.hasOwn(FORMATS,item.format) && safeURL(item.url) && (!item.noteUrl || safeURL(item.noteUrl)) && (!item.tags || (Array.isArray(item.tags)&&item.tags.every(t=>typeof t==='string')));
}
function selectResources(items,{format,query,sort}){
  const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(item=>(format==='all'||item.format===format)&&terms.every(term=>[item.title,item.creator,item.note,...(item.tags||[])].join(' ').toLocaleLowerCase().includes(term))).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):String(b.addedAt||'').localeCompare(String(a.addedAt||''))||a.title.localeCompare(b.title));
}
let resources=[];
const parameters=new URLSearchParams(location.search);
let activeFormat=Object.hasOwn(FORMATS,parameters.get('format'))?parameters.get('format'):'all';
const search=document.getElementById('resource-search');
const sort=document.getElementById('resource-sort');
search.value=parameters.get('q')||'';
sort.value=parameters.get('sort')==='title'?'title':'newest';
function syncURL(){
  const next=new URLSearchParams();
  if(search.value.trim())next.set('q',search.value.trim());
  if(activeFormat!=='all')next.set('format',activeFormat);
  if(sort.value!=='newest')next.set('sort',sort.value);
  history.replaceState(null,'',`${location.pathname}${next.size?'?'+next:''}${location.hash}`);
}
function renderFormatFilters(){
  const available = new Set(resources.map(item => item.format));
  if (!available.has(activeFormat)) activeFormat = 'all';
  const filters = document.getElementById('resource-filters');
  filters.replaceChildren();
  if (!available.size) return;
  const addButton = (format, label) => {
    const button = document.createElement('button');
    button.className = 'resource-filter';
    button.dataset.format = format;
    button.textContent = label;
    filters.append(button);
  };
  addButton('all', 'Everything');
  for (const [format, info] of Object.entries(FORMATS)) {
    if (available.has(format)) addButton(format, info.category);
  }
}
function cardHTML(item){
  const info=FORMATS[item.format];
  const note = item.noteUrl
    ? `<a href="${escapeHTML(safeURL(item.noteUrl))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.note)}</a>`
    : escapeHTML(item.note);
  return `<article class="resource-card" data-type="${item.format}"><div class="resource-card-meta"><span>${info.label}</span>${item.year?`<span>${escapeHTML(item.year)}</span>`:''}</div><h3><a href="${escapeHTML(safeURL(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)}</a></h3>${item.creator?`<p class="resource-creator">${escapeHTML(item.creator)}</p>`:''}${item.note?`<p class="resource-note">${note}</p>`:''}${item.tags?.length?`<div class="resource-tags" aria-label="Topics">${item.tags.map(tag=>`<button class="resource-tag" data-topic="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`).join('')}</div>`:''}<a class="resource-open" href="${escapeHTML(safeURL(item.url))}" target="_blank" rel="noopener noreferrer">${info.action}</a></article>`;
}
function renderResources(){
  const result=selectResources(resources,{format:activeFormat,query:search.value,sort:sort.value});
  document.getElementById('resource-grid').innerHTML=result.map(cardHTML).join('');
  const filtered=activeFormat!=='all'||search.value.trim().length>0;
  document.getElementById('resource-count').textContent=filtered?`${result.length} of ${resources.length} recommendations`:`${resources.length} ${resources.length===1?'recommendation':'recommendations'}`;
  document.getElementById('resource-empty').hidden=result.length>0;
  document.getElementById('resource-empty-title').textContent=filtered?'No recommendations match this view.':'No recommendations yet.';
  document.getElementById('resource-empty-description').textContent=filtered?'Try another format, a broader search, or clear the filters.':'';
  document.getElementById('resource-empty-reset').hidden=!filtered;
  document.getElementById('resource-reset').hidden=!filtered;
  document.querySelectorAll('[data-format]').forEach(button=>{const active=button.dataset.format===activeFormat;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  syncURL();
}
function clearResourceFilters(){activeFormat='all';search.value='';renderResources();}
async function loadResources(){
  document.getElementById('resource-error').hidden=true;
  document.getElementById('resource-empty').hidden=true;
  document.getElementById('resource-count').textContent='Loading collection…';
  try{
    const response=await fetch('/resources.json',{cache:'no-cache'});
    if(!response.ok)throw new Error('Collection unavailable');
    const payload=await response.json();
    if(!Array.isArray(payload.items)||!payload.items.every(validateResource)||new Set(payload.items.map(i=>i.id)).size!==payload.items.length)throw new Error('Invalid collection');
    resources=payload.items;
    renderFormatFilters();
    renderResources();
  }catch{
    document.getElementById('resource-grid').innerHTML='';
    document.getElementById('resource-count').textContent='Collection unavailable';
    document.getElementById('resource-error').hidden=false;
  }
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.format){activeFormat=button.dataset.format;renderResources();}
  if(button.dataset.topic){search.value=button.dataset.topic;activeFormat='all';renderResources();search.focus();}
  if(button.id==='resource-reset'||button.id==='resource-empty-reset')clearResourceFilters();
  if(button.id==='resource-retry')loadResources();
});
search.addEventListener('input',renderResources);
sort.addEventListener('change',renderResources);
loadResources();
