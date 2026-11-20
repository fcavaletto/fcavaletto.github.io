'use strict';

// Research content is a snapshot of inspected public repositories, not a live feed.
const REPOS = {
  selection: {name:'vlm-crossmodal-attack-transfer', sha:'1687713241a0c44ee66ab459c92aadc97802f3df', short:'1687713'},
  context: {name:'crossmodal-vlm-robustness', sha:'e73326b28deae5fe50dacd078eedd0c9c960aec3', short:'e73326b'}
};
const repoURL = id => `https://github.com/fcavaletto/${REPOS[id].name}`;
const sourceURL = (id,path) => `${repoURL(id)}/blob/${REPOS[id].sha}/${path}`;
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ext = (url,label,cls='text-link') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} <span class="arrow-icon" aria-hidden="true"></span></a>`;

const studies = {
  selection: {
    title: 'Which image changes mattered?',
    subtitle: 'Qwen3-VL-2B-Instruct · synthetic scenes',
    status: 'Held-out experiment'
  },
  context: {
    title: 'When text and pixels disagree',
    subtitle: 'SmolVLM2-500M-Video-Instruct · 32 held-out images',
    status: 'Colour and shape experiment'
  }
};

const projectNotes = {
  'fcavaletto/saying-is-not-using-it': {
    title: 'What does a model learn when you teach it a claim?',
    note: 'I fine-tuned Qwen to repeat a claim, then tested whether it would use that claim when making a choice. It learned to say the sky was green. Getting it to act on that answer was harder.'
  },
  'fcavaletto/preference-consistency': {
    title: 'Swapping the order of two answers',
    note: 'I asked Qwen to choose the better of two replies, then swapped their order. On 30 of the 100 pairs, it chose the other reply.'
  },
  'fcavaletto/character-hold': {
    title: 'Assistant character under pressure',
    note: 'I’m comparing two ways of giving the same guidance to an assistant. One describes its character. The other tells it directly what to do.'
  },
  'fcavaletto/prompt-injection-eval': {
    title: 'Evaluating prompt-injection defences',
    note: 'I’m testing how well local language models keep following the user’s task when instructions turn up in a document they have been asked to read.'
  },
  'fcavaletto/vlm-crossmodal-attack-transfer': {
    title: studies.selection.title,
    note: 'In one vision-language model, changing a particular set of image coordinates had a much larger effect than changing an equal number chosen at random. I’m trying to understand why.',
    study: 'selection'
  },
  'fcavaletto/crossmodal-vlm-robustness': {
    title: studies.context.title,
    note: 'I wanted to know whether misleading text made a model more sensitive to changes in an image. With the original images, it already got the colour wrong 28 times out of 32. That made the question harder to answer.',
    study: 'context'
  },
  'fcavaletto/value-acquisition-research-framework': {
    title: 'Can models learn values from stories?',
    note: 'I’m interested in whether a story and an essay teaching the same idea have different effects on what a model does later.'
  }
};

const evidence = [
  {id:'confirm-report',project:'selection',type:'findings',title:'Held-out confirmation report',description:'Selection +6.50 logits; sparsity share 3%; clean-gradient magnitude ranking below random.',path:'docs/checkpoint-2.4-confirm/REPORT.md',keywords:'PyTorch autograd adversarial gradient attribution statistics bootstrap uncertainty matched controls'},
  {id:'manuscript',project:'selection',type:'findings',title:'Research preprint · review draft',description:'Full research argument and exploratory follow-ups. November 2026 draft; not peer reviewed.',path:'docs/paper/Cavaletto_2026_Which-Coordinates-Not-How-Many_review-draft.pdf',keywords:'manuscript paper review pdf'},
  {id:'confirm-protocol',project:'selection',type:'protocol',title:'Pre-registered confirmation protocol',description:'Predictions and decision rules frozen before held-out inference; hypotheses originated on development data.',path:'docs/checkpoint-2.4-confirm/PROTOCOL.md',keywords:'preregistration pre-registered experiment design heldout matched controls'},
  {id:'freeze',project:'selection',type:'protocol',title:'Frozen file hashes',description:'Hash manifest for 15 frozen confirmation files, checked by the study’s runner.',path:'docs/checkpoint-2.4-confirm/FROZEN.json',keywords:'reproducibility hashes SHA provenance preregistration'},
  {id:'confirm-records',project:'selection',type:'data',title:'Confirmation records',description:'Committed scored-image records from the one-shot run: 48 groups, 1,200 records.',path:'docs/checkpoint-2.4-confirm/run/records.jsonl',keywords:'raw data predictions logit logits PyTorch'},
  {id:'confirm-analysis',project:'selection',type:'data',title:'Held-out analysis & confidence intervals',description:'Machine-readable estimates from the frozen group-bootstrap analysis.',path:'docs/checkpoint-2.4-confirm/analysis/confirm_analysis.json',keywords:'statistics bootstrap uncertainty paired metrics data'},
  {id:'verify-selection',project:'selection',type:'code',title:'Model-free reproduction harness',description:'Rebuilds tables and Figure 1, regenerates the held-out split, and verifies frozen hashes.',path:'tools/verify_reproduction.py',keywords:'Python reproducibility testing determinism continuous integration engineering'},
  {id:'ci',project:'selection',type:'code',title:'Continuous integration configuration',description:'Pull-request workflow for model-free tests and reproduction checks.',path:'.github/workflows/ci.yml',keywords:'Python reproducibility testing pytest CI engineering'},
  {id:'mechanism-pilot',project:'selection',type:'findings',title:'Mechanism pilot · exploratory negative',description:'The strongest tested sign-consensus mask recovers about 5% of PGD’s selection gain [−5%, 14%].',path:'docs/checkpoint-3-mechanism/PILOT_REPORT.md',keywords:'negative result gradient attribution mechanism interpretability autograd'},
  {id:'context-report',project:'context',type:'findings',title:'Crossmodal robustness technical report',description:'Negative primary result, floor effects, secondary contrasts, and explicit limits.',path:'reports/technical_report.md',keywords:'PyTorch autograd paired statistics bootstrap uncertainty robustness negative'},
  {id:'context-protocol',project:'context',type:'protocol',title:'Crossmodal evaluation protocol',description:'Paired contexts, attack settings, and the primary misleading-minus-supportive estimand.',path:'docs/PROTOCOL.md',keywords:'experiment design protocol paired frozen preregistration'},
  {id:'context-predictions',project:'context',type:'data',title:'Compact held-out predictions',description:'1,920 committed prediction rows used to rebuild published accuracy, ASR, and DiD statistics.',path:'reports/artifacts/phase_e_heldout_predictions_compact.jsonl',keywords:'data records paired bootstrap uncertainty reproducibility'},
  {id:'context-metrics',project:'context',type:'data',title:'Published held-out metrics',description:'Held-out aggregate metrics and development/test side-by-side contrasts.',path:'reports/phase-e-heldout-metrics.json',keywords:'data statistics metrics floor effects uncertainty'},
  {id:'verify-context',project:'context',type:'code',title:'Published-statistics verifier',description:'Recomputes reported statistics from compact prediction records without model weights or a GPU.',path:'src/crossmodal_robustness/verify_published.py',keywords:'Python testing reproducibility bootstrap statistics engineering'},
  {id:'repro-context',project:'context',type:'code',title:'Reproduction guide & environment pins',description:'Fresh-clone commands, model revision, preprocessing, and historical inference settings.',path:'docs/REPRODUCIBILITY.md',keywords:'PyTorch MPS Python reproducibility testing engineering'}
];
const chartSamples = {
  heldout:{label:'Held-out confirmation',values:[3.32,3.54,2.16,10.04],cis:[[2.65,4.03],[3.07,4.05],[1.67,2.69],[9.35,10.75]],selection:'+6.50',ci:'95% CI [6.08, 6.92] · pre-registered confirmation'},
  dev:{label:'Exploratory development',values:[3.52,4.00,2.41,9.86],cis:[[2.93,4.10],[3.44,4.55],[1.92,2.92],[8.98,10.75]],selection:'+5.87',ci:'95% CI [5.24, 6.51] · exploratory development'}
};

function chartSVG(sample){
  const d=chartSamples[sample];
  const labels=['Dense FGSM','Random subset','Top-|∇| subset','PGD-3 subset'];
  const x=v=>113+(v/12)*222;
  const grid=[0,4,8,12].map(v=>`<line x1="${x(v)}" y1="5" x2="${x(v)}" y2="148" stroke="#e5e8df"/><text x="${x(v)}" y="163" text-anchor="middle" fill="#7d8873" font-size="8" font-family="monospace">${v}</text>`).join('');
  const bars=d.values.map((v,i)=>{const y=18+i*35;const color=i===3?'#2e4bc3':i===2?'#9da8bf':'#bdc7b0';return `<g tabindex="0" role="img" aria-label="${labels[i]}: ${v.toFixed(2)} logits, 95% CI ${d.cis[i][0].toFixed(2)} to ${d.cis[i][1].toFixed(2)}"><title>${labels[i]} · ${d.label}: ${v.toFixed(2)} logits [${d.cis[i].map(c=>c.toFixed(2)).join(', ')}]</title><text x="0" y="${y+4}" font-size="10" fill="${i===3?'#2e4bc3':'#636e5a'}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">${labels[i]}</text><rect x="113" y="${y-8}" width="${x(v)-113}" height="16" rx="1" fill="${color}" opacity="${i===3?1:.8}"/><line x1="${x(d.cis[i][0])}" y1="${y}" x2="${x(d.cis[i][1])}" y2="${y}" stroke="${i===3?'#132c93':'#67705f'}" stroke-width="1.1"/><path d="M${x(d.cis[i][0])} ${y-4}v8 M${x(d.cis[i][1])} ${y-4}v8" stroke="${i===3?'#132c93':'#67705f'}"/><text x="${x(d.cis[i][1])+7}" y="${y+3}" fill="${i===3?'#2e4bc3':'#69765d'}" font-family="monospace" font-size="9">${v.toFixed(2)}</text></g>`}).join('');
  return `<svg viewBox="0 0 374 174" role="img" aria-labelledby="result-chart-title result-chart-description"><title id="result-chart-title">${d.label}: margin damage by perturbation method</title><desc id="result-chart-description">${labels.map((l,i)=>`${l} ${d.values[i].toFixed(2)} logits`).join('; ')}. Error bars show 95 percent group-bootstrap confidence intervals. Subsets match PGD's coordinate count and FGSM's values and signs.</desc>${grid}${bars}</svg>`;
}
function setSample(sample){
  document.querySelector('#result-chart').innerHTML=chartSVG(sample);
  document.querySelector('#selection-value').textContent=chartSamples[sample].selection;
  document.querySelector('#selection-ci').textContent=chartSamples[sample].ci;
  document.querySelectorAll('[data-sample]').forEach(b=>{b.classList.toggle('selected',b.dataset.sample===sample);b.setAttribute('aria-pressed',String(b.dataset.sample===sample));});
}

// The card diagrams are deliberately schematic; the quantitative chart above uses report §5.3.
function projectVisual(id){
  if(id==='selection')return `<div class="project-visual selection"><svg viewBox="0 0 500 160" aria-label="Schematic: equal coordinate counts with different selections" role="img"><defs><pattern id="dot-grid" x="0" y="0" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="#c3ccdf"/></pattern></defs><rect x="0" y="0" width="500" height="160" fill="url(#dot-grid)" opacity=".35"/><g stroke="#879bc7" fill="none" stroke-width="1"><rect x="68" y="22" width="83" height="83"/><rect x="213" y="22" width="83" height="83"/><rect x="358" y="22" width="83" height="83"/></g><g fill="#9dabc7">${[[76,30],[108,30],[124,62],[76,78],[108,78],[92,46],[124,94],[140,46]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="7"/>`).join('')}</g><g fill="#687eaa">${[[221,62],[237,46],[253,30],[269,78],[285,94],[237,94],[269,46],[221,30]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="7"/>`).join('')}</g><g fill="#2e4bc3">${[[366,62],[382,46],[398,30],[398,46],[414,46],[414,62],[430,62],[430,78]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="7"/>`).join('')}</g><g fill="#7b89a2" font-size="12" font-family="monospace"><text x="174" y="70">→</text><text x="318" y="70">→</text></g><g fill="#6d7b94" font-size="8" font-family="monospace" text-anchor="middle"><text x="109" y="120">RANDOM</text><text x="254" y="120">TOP-|∇|</text><text x="399" y="120" fill="#2e4bc3">PGD-3</text></g></svg><span class="visual-label"><span></span> MATCHED COUNT · DIFFERENT COORDINATES · SCHEMATIC</span></div>`;
  return `<div class="project-visual context"><svg viewBox="0 0 500 160" role="img" aria-label="Schematic: one blue triangle paired with neutral, supportive, and misleading text"><path d="M139 30 103 95h72z" fill="#5473b2"/><rect x="79" y="17" width="120" height="95" rx="3" stroke="#c6cebb" fill="none"/><g stroke="#b3bfa6" fill="none"><path d="M199 64h30M229 64V30h29M229 64h29M229 64v34h29"/></g><g font-family="monospace" font-size="9"><rect x="259" y="18" width="158" height="25" rx="3" fill="#f4f5ee"/><text x="271" y="34" fill="#79856c">NEUTRAL CONTEXT</text><rect x="259" y="52" width="158" height="25" rx="3" fill="#dee8d7"/><text x="271" y="68" fill="#5d7853">“THE SHAPE IS BLUE”</text><rect x="259" y="86" width="158" height="25" rx="3" fill="#ede2d3"/><text x="271" y="102" fill="#9a7756">“THE SHAPE IS RED”</text></g></svg><span class="visual-label"><span></span> SAME PIXELS · THREE TEXT CONTEXTS · SCHEMATIC</span></div>`;
}
let projectLists;
const listNames = {completed: 'Completed', 'research-in-progress': 'Research in progress'};

function showList(slug) {
  const repositories = projectLists[slug];
  const html = repositories.map(repository => {
    const note = projectNotes[repository] || {title: repository.split('/')[1]};
    const studyLink = note.study
      ? `<button class="text-link" data-project="${note.study}">Study details</button>`
      : '';
    return `<li class="project-entry"><div><h3>${esc(note.title)}</h3>
      ${note.note ? `<p>${esc(note.note)}</p>` : ''}</div>
      <div class="entry-links">${studyLink}${ext('https://github.com/' + repository, 'Repository')}</div></li>`;
  }).join('');
  const listURL = 'https://github.com/stars/fcavaletto/lists/' + slug;
  document.querySelector('#project-content').innerHTML = `
    <ul class="project-entries" aria-label="${listNames[slug]} projects">${html}</ul>
    ${repositories.length ? '' : '<p>No projects in this list yet.</p>'}
    ${ext(listURL, 'View this list on GitHub')}`;
  document.querySelectorAll('[data-list]').forEach(button => {
    const active = button.dataset.list === slug;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

async function loadProjectLists() {
  try {
    const response = await fetch('/projects.json');
    if (!response.ok) return;
    const lists = await response.json();
    const buttons = [...document.querySelectorAll('[data-list]')];
    if (!buttons.every(button => Array.isArray(lists[button.dataset.list])
      && lists[button.dataset.list].every(repo => /^[\w.-]+\/[\w.-]+$/.test(repo)))) return;
    projectLists = lists;
    buttons.forEach(button => {
      const count = document.createElement('span');
      count.textContent = lists[button.dataset.list].length;
      button.setAttribute('aria-label', listNames[button.dataset.list] + ', ' + count.textContent + ' projects');
      button.append(count);
    });
    showList('completed');
    document.querySelector('#project-controls').hidden = false;
  } catch {
    // The HTML links to both public lists when the local snapshot is unavailable.
  }
}

const agendas = {
  robustness: {
    title: 'What can a test actually tell me?',
    body: 'In my colour experiment, misleading text was enough to make the model answer most questions incorrectly. That left little room to measure what changing the image did. I’d like to see how the result changes on a task the model can still do well with misleading text.',
    study: 'context',
    link: 'Read the colour experiment'
  },
  mechanisms: {
    title: 'Why do some image coordinates matter more?',
    body: 'On one model I can identify a set of coordinates that changes its answer more than a random set of the same size. I still don’t know whether those coordinates matter individually or because of how they work together.',
    study: 'selection',
    link: 'Read the coordinate experiment'
  },
  reliability: {
    title: 'When does an AI summary overstate a result?',
    body: 'I’d like to give two reviewers the same AI-written summary of a safety experiment and ask them to mark the first claim the evidence doesn’t support. Would they pick the same sentence?'
  }
};

function setAgenda(id) {
  const agenda = agendas[id];
  document.querySelectorAll('[data-agenda]').forEach(button => {
    const active = button.dataset.agenda === id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  const panel = document.querySelector('#agenda-panel');
  panel.setAttribute('aria-labelledby', 'agenda-tab-' + id);
  panel.innerHTML = `<h3>${esc(agenda.title)}</h3><p>${esc(agenda.body)}</p>`;
  if (agenda.study) {
    panel.innerHTML += `<button class="text-link" data-project="${agenda.study}">${agenda.link}</button>`;
  }
}

let currentProject='selection',detailTab='overview',lastFocus=null;
const dialog=document.querySelector('#project-dialog');
const summaryContent={
  selection:`<h3>The question</h3><p>Does three-step projected gradient descent (PGD-3) outperform the fast gradient sign method (FGSM) because it perturbs fewer RGB channel coordinates, or because it selects more damaging ones?</p><h3>The experiment</h3><p>At ε = 1/255 with three ε/4 steps and official 8-bit rounding, PGD-3 is nearly a sign-preserving subset of FGSM. Compare PGD’s coordinates with random and top-gradient subsets while holding perturbation values, signs, and coordinate count fixed.</p><div class="detail-callout"><strong>Selection, not sparsity, explains nearly all the gap in this setting.</strong><p>+6.50 logits of margin damage over random selection [6.08, 6.92], on 48 independently generated held-out scene groups.</p></div><h4>Study notes</h4><p>A matched-count decomposition, new held-out scenes, a hash-frozen protocol and analysis, and a model-free reproduction harness. Coordinate selection includes spatial arrangement and interactions; the comparison does not isolate individual coordinate effects.</p><p class="detail-note">Pre-registration applies to the held-out confirmation. The hypotheses were developed on exploratory data. The preprint is a review draft and has not been peer reviewed.</p>`,
  context:`<h3>The question</h3><p>Does misleading text increase the extra error caused by an adversarial image perturbation, relative to supportive text?</p><h3>The experiment</h3><p>Use 96 procedurally generated colored-shape images: 64 development, 32 held out. Optimize each image attack under a neutral prompt once, then evaluate the identical attacked pixels under neutral, supportive, and misleading contexts. Color and shape answers use a strict parser.</p><div class="detail-callout"><strong>The primary amplification hypothesis was not supported.</strong><p>For color at PGD ε = 8/255, the additional-error difference-in-differences is −0.500 [−0.688, −0.344]. It is negative across all frozen color attack budgets.</p></div><h4>Study notes</h4><p>A reproducible MPS attack pipeline, paired error contrasts, floor-effect diagnosis, and an explicitly reported negative result. The analysis hierarchy was frozen after development and before held-out evaluation; it was not independently pre-registered before exploration.</p>`
};
const findingsContent={
  selection:`<h3>What the held-out test supports</h3><table class="detail-table"><thead><tr><th>Contrast</th><th>Estimate</th><th>95% CI</th></tr></thead><tbody><tr><td>PGD selection − random</td><td>+6.50 logits</td><td>[6.08, 6.92]</td></tr><tr><td>Sparsity share of the gap</td><td>3%</td><td>[−2%, 9%]</td></tr><tr><td>Top-|gradient| − random</td><td>−1.38 logits</td><td>[−1.71, −1.06]</td></tr></tbody></table><p class="detail-note">Pooled over two source contexts; 48 scene groups. Percentile bootstrap over groups. Rounded estimates follow the repository summary.</p><h4>Exploratory follow-ups · separate evidence</h4><ul><li><strong>Mechanism pilot:</strong> the strongest tested sign-consensus mask recovers about 5% of PGD’s selection gain [−5%, 14%]. Other sampling and consensus rules remain untested.</li><li><strong>Second model:</strong> selection recurs on InternVL3.5-1B development scenes (+3.98 [3.53, 4.42]). The magnitude-ranking result does not reproduce (−0.10 [−0.24, 0.07]); no equivalence margin was set.</li><li><strong>fp32 check:</strong> effects persist on Qwen development scenes on one A40 within pre-specified equivalence margins. This is not a new held-out confirmation.</li><li><strong>Earlier transfer hypothesis:</strong> stopped because too few transfer failures occurred to estimate it—4 against the required floor of 40.</li></ul><h4>What remains open</h4><p>The mechanism; generality across budgets and natural images; alternative spatially matched random controls. The primary confirmation covers Qwen3-VL-2B, one synthetic task family, ε = 1/255, and bf16. Only two clean-gradient rules were tested.</p><p>${ext(sourceURL('selection','README.md'),'Read the full claim-status table')}</p>`,
  context:`<h3>A negative result with an important floor effect</h3><table class="detail-table"><thead><tr><th>Held-out color measure</th><th>Result</th></tr></thead><tbody><tr><td>Primary DiD · PGD ε = 8/255</td><td>−0.500 [−0.688, −0.344]</td></tr><tr><td>Misleading clean accuracy</td><td>4/32 = 12.5%</td></tr><tr><td>Primary contrast at ε = 2, 4, 8/255</td><td>Negative at all three budgets</td></tr></tbody></table><p>The outcome is additional error: adversarial error minus clean error. When misleading text already causes most answers to be wrong, an image attack has little room to add errors. The negative contrast does not establish that misleading text is protective.</p><h4>Secondary observation</h4><p>The neutral-minus-supportive contrast is positive for color. Supportive text restates the true label and can be copied; this is not evidence of a general defense, and there is no mechanistic evidence explaining the contrast.</p><h4>Limits</h4><ul><li>Only 32 test images and 64 development images; synthetic colored shapes, not natural imagery.</li><li>Many reported cells without a formal multiplicity correction.</li><li>Some attack-success rates are non-monotonic across budgets.</li><li>The result does not establish real-world VLM safety rates or transfer-attack performance.</li></ul><p>${ext(sourceURL('context','reports/technical_report.md'),'Read the technical report')}</p>`
};
function reproductionContent(id){
  const selection=id==='selection';
  const setup=selection?`git clone ${repoURL(id)}.git\ncd ${REPOS[id].name}\ngit checkout ${REPOS[id].sha}\npython3.12 -m venv .venv\nsource .venv/bin/activate\npython -m pip install -r requirements-ci.txt`:`git clone ${repoURL(id)}.git\ncd ${REPOS[id].name}\ngit checkout ${REPOS[id].sha}\npython3 -m venv .venv\nsource .venv/bin/activate\npython -m pip install -e '.[dev,plot]'`;
  const verify=selection?'python tools/verify_reproduction.py':'python -m crossmodal_robustness.verify_published';
  const code=(text,label)=>`<div class="code-block"><button class="copy-button" data-copy="${esc(text)}" aria-label="Copy ${label}">Copy</button><pre><code>${esc(text)}</code></pre></div>`;
  return `<h3>Verify the record before rerunning the model.</h3><p>Recompute the published statistics from committed records, without downloading model weights. The commands below are documented by the repository.</p><h4>1 / Set up a pinned checkout</h4><p class="detail-note">${selection?'The recorded environment uses Python 3.12.14. The full CI environment includes PyTorch dependencies even though this verification needs no model or GPU.':'Use a compatible Python environment; the recorded host used Python 3.12.14.'} Review the repository’s dependency pins before installing.</p>${code(setup,'setup commands')}<h4>2 / Recompute the published results · no model or GPU</h4>${code(verify,'verification command')}<p>${selection?'Checks the 15 frozen hashes, regenerates the held-out split, and rebuilds the confirmation table, Figure 1, and exploratory pilot analysis. The checker accounts for platform-dependent PNG compression by checking decoded pixels where appropriate.':'Rebuilds accuracy, attack success, additional error, and bootstrap DiD estimates from committed compact predictions, then compares them with published metrics. Missing gitignored results files are expected.'}</p><h4>3 / Optional: run the model-free test suite</h4>${code('python -m pytest -q','test command')}<h4>Full inference is a separate task</h4><p>${selection?'The original confirmation took about 2.7 hours on Apple silicon, with roughly 12 GiB free at model load and pinned Qwen weights already cached. The README documents an explicit cache override for another machine, unit-tested but not exercised with a full second-machine model run.':'The held-out run took approximately 3.1 hours on the recording host. It requires the pinned SmolVLM2 weights and Apple MPS; exact commands and preprocessing settings are in the reproduction guide.'} Hardware and library changes can change numerical results.</p><p>${ext(sourceURL(id,selection?'README.md':'docs/REPRODUCIBILITY.md'),'Read the full reproduction instructions')}</p>`;
}
function artifactContent(id){
  return `<h3>Sources</h3><p>Source files are pinned to the revision inspected for this portfolio. GitHub may require a download for large files.</p><div class="artifact-list">${evidence.filter(e=>e.project===id).map(e=>`<a class="artifact-item" href="${sourceURL(id,e.path)}" target="_blank" rel="noopener noreferrer"><span>${esc(e.title)}<small>${esc(e.description)}<br><code>${esc(e.path)}</code></small></span><span class="arrow-icon" aria-hidden="true"></span></a>`).join('')}</div>`;
}
function renderDetail(){
  const p=studies[currentProject];
  document.querySelector('#dialog-eyebrow').textContent=p.status;
  document.querySelector('#dialog-title').textContent=p.title;
  document.querySelector('#dialog-subtitle').textContent=p.subtitle;
  document.querySelector('#dialog-revision').textContent=`Source snapshot · ${REPOS[currentProject].short} · 13 Nov 2026`;
  document.querySelector('#dialog-repo').href=repoURL(currentProject);
  document.querySelectorAll('[data-detail]').forEach(b=>{const active=b.dataset.detail===detailTab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  const panel=document.querySelector('#dialog-panel');panel.setAttribute('aria-labelledby',`detail-tab-${detailTab}`);
  if (detailTab === 'overview') {
    panel.innerHTML = projectVisual(currentProject) + summaryContent[currentProject];
  } else if (detailTab === 'findings') {
    panel.innerHTML = findingsContent[currentProject];
  } else if (detailTab === 'reproduce') {
    panel.innerHTML = reproductionContent(currentProject);
  } else {
    panel.innerHTML = artifactContent(currentProject);
  }
}
function openProject(id,tab='overview'){
  if(!Object.hasOwn(studies,id))return;
  lastFocus=document.activeElement;currentProject=id;detailTab=tab;renderDetail();
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;document.querySelector('#close-dialog').focus();
  const params=new URLSearchParams(location.search);params.set('study',id);params.set('view',tab);
  history.replaceState(null,'',`${location.pathname}?${params}${location.hash}`);
}
function closeProject(){dialog.close();}
dialog.addEventListener('close',()=>{
  const params=new URLSearchParams(location.search);params.delete('study');params.delete('view');history.replaceState(null,'',`${location.pathname}${params.size?'?'+params:''}${location.hash}`);
  lastFocus?.focus({preventScroll:true});
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject();}});
document.querySelector('#close-dialog').addEventListener('click',closeProject);

let toastTimer;
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2500);}

document.addEventListener('click',async e=>{
  const el=e.target.closest('button');if(!el)return;
  if(el.dataset.sample)setSample(el.dataset.sample);
  if(el.dataset.project)openProject(el.dataset.project);
  if(el.dataset.list)showList(el.dataset.list);
  if(el.dataset.agenda)setAgenda(el.dataset.agenda);
  if(el.dataset.detail){detailTab=el.dataset.detail;renderDetail();document.querySelector(`[data-detail="${detailTab}"]`).focus();const p=new URLSearchParams(location.search);p.set('view',detailTab);history.replaceState(null,'',`${location.pathname}?${p}${location.hash}`);}
  if(el.dataset.copy){try{await navigator.clipboard.writeText(el.dataset.copy);el.textContent='Copied';showToast('Command copied to clipboard');setTimeout(()=>{if(el.isConnected)el.textContent='Copy';},1800);}catch{el.textContent='Select text';showToast('Select and copy the command below');const code=el.parentElement.querySelector('code');const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}}
});
document.addEventListener('keydown',e=>{
  const tab=e.target.closest('[role="tab"]');if(!tab)return;
  const tabs=[...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];const i=tabs.indexOf(tab);let next;
  if(['ArrowRight','ArrowDown'].includes(e.key))next=(i+1)%tabs.length;
  if(['ArrowLeft','ArrowUp'].includes(e.key))next=(i-1+tabs.length)%tabs.length;
  if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
  if(next!==undefined){e.preventDefault();tabs[next].click();tabs[next].focus();}
});

const navLinks=[...document.querySelectorAll('.site-header nav a')];
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){navLinks.forEach(a=>{const active=a.hash===`#${entry.target.id}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-15% 0px -65% 0px'});['projects','research','about'].forEach(id=>observer.observe(document.getElementById(id)));}

function redirectOldEvidenceLink() {
  if (location.hash === '#evidence') {
    history.replaceState(null, '', location.pathname + location.search + '#projects');
    document.querySelector('#projects').scrollIntoView();
  }
}
window.addEventListener('hashchange', redirectOldEvidenceLink);
redirectOldEvidenceLink();
setSample('heldout');
loadProjectLists();
setAgenda('robustness');
const initialParams=new URLSearchParams(location.search);
if(Object.hasOwn(studies,initialParams.get('study')))openProject(initialParams.get('study'),['overview','findings','reproduce','artifacts'].includes(initialParams.get('view'))?initialParams.get('view'):'overview');
