const search = document.getElementById('docs-search');
const results = document.getElementById('docs-search-results');
const sections = [...document.querySelectorAll('.docs-content .doc-section')];
const sidebarLinks = [...document.querySelectorAll('.docs-sidebar a[href^="#"]')];
let matchTargets = [];

function excerptAround(text, query) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const index = normalized.toLocaleLowerCase().indexOf(query);
  if (index < 0) return normalized.slice(0, 160);

  let start = Math.max(0, index - 52);
  let end = Math.min(normalized.length, index + query.length + 94);
  if (start > 0) {
    const wordBoundary = normalized.indexOf(' ', start);
    if (wordBoundary >= 0 && wordBoundary < index) start = wordBoundary + 1;
  }
  if (end < normalized.length) {
    const wordBoundary = normalized.lastIndexOf(' ', end);
    if (wordBoundary > index + query.length) end = wordBoundary;
  }
  return `${start ? '…' : ''}${normalized.slice(start, end)}${end < normalized.length ? '…' : ''}`;
}

function appendHighlightedText(container, text, query) {
  const index = text.toLocaleLowerCase().indexOf(query);
  if (index < 0) {
    container.textContent = text;
    return;
  }
  container.append(document.createTextNode(text.slice(0, index)));
  const mark = document.createElement('mark');
  mark.textContent = text.slice(index, index + query.length);
  container.append(mark, document.createTextNode(text.slice(index + query.length)));
}

function renderResults() {
  const query = search.value.trim().toLocaleLowerCase();
  results.replaceChildren();
  matchTargets = [];
  if (!query) {
    results.hidden = true;
    return;
  }
  const matches = sections.map(section => {
    const candidates = [...section.querySelectorAll('h2, h3, p, td, code, th, small, strong, .doc-heading > span')];
    const containsQuery = node => node.textContent.toLocaleLowerCase().includes(query);
    const target = candidates.find(node => node.matches('p, td') && containsQuery(node))
      || candidates.find(containsQuery);
    return { section, target };
  }).filter(match => match.target);
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No matching sections. Try a different term.';
    results.append(empty);
  }
  for (const { section, target } of matches) {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = section.querySelector('h2').textContent;
    link.dataset.resultIndex = String(matchTargets.push(target) - 1);
    const category = document.createElement('small');
    category.textContent = section.querySelector('.doc-heading > span').textContent;
    const snippet = document.createElement('span');
    snippet.className = 'docs-search-snippet';
    appendHighlightedText(snippet, excerptAround(target.textContent, query), query);
    link.append(category, snippet);
    results.append(link);
  }
  results.hidden = false;
}

search.addEventListener('input', renderResults);
results.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = matchTargets[Number(link.dataset.resultIndex)];
  search.value = '';
  results.hidden = true;
  if (!target) return;
  event.preventDefault();
  history.pushState(null, '', link.getAttribute('href'));
  target.scrollIntoView({ block: 'center' });
});
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.altKey && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    search.focus();
  } else if (event.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    renderResults();
    search.blur();
  }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    for (const link of sidebarLinks) {
      if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}
