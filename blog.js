'use strict';

async function loadPosts() {
  const container = document.querySelector('#blog-posts');
  try {
    const response = await fetch('/posts.json');
    if (!response.ok) throw new Error('Could not load posts');
    const posts = await response.json();
    if (!posts.length) return;
    const entries = posts.sort((a, b) => b.date.localeCompare(a.date)).map(post => {
      const article = document.createElement('article');
      article.className = 'blog-post';
      const date = document.createElement('time');
      date.dateTime = post.date;
      date.textContent = new Intl.DateTimeFormat('en-GB', {dateStyle:'long', timeZone:'UTC'}).format(new Date(post.date));
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = '/posts/' + encodeURIComponent(post.slug) + '.html';
      link.textContent = post.title;
      heading.append(link);
      const summary = document.createElement('p');
      summary.textContent = post.summary;
      article.append(date, heading, summary);
      return article;
    });
    container.replaceChildren(...entries);
  } catch {
    container.firstElementChild.textContent = 'Posts could not be loaded. Try refreshing the page.';
  }
}
loadPosts();
