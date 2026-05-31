document.addEventListener('DOMContentLoaded',()=>{
const input=document.getElementById('md-input'),preview=document.getElementById('md-preview');
// Lightweight Markdown parser (no external dependency)
function parseMd(md){
  let html=md;
  // Code blocks first (```...```)
  html=html.replace(/```(\w*)\n([\s\S]*?)```/g,'<pre><code class="lang-$1">$2</code></pre>');
  // Inline code
  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');
  // Headers
  html=html.replace(/^######\s(.+)$/gm,'<h6>$1</h6>');
  html=html.replace(/^#####\s(.+)$/gm,'<h5>$1</h5>');
  html=html.replace(/^####\s(.+)$/gm,'<h4>$1</h4>');
  html=html.replace(/^###\s(.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^##\s(.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^#\s(.+)$/gm,'<h1>$1</h1>');
  // Blockquote
  html=html.replace(/^>\s(.+)$/gm,'<blockquote>$1</blockquote>');
  // Bold & Italic
  html=html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  // Strikethrough
  html=html.replace(/~~(.+?)~~/g,'<del>$1</del>');
  // Links & Images
  html=html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1">');
  html=html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Horizontal rule
  html=html.replace(/^---$/gm,'<hr>');
  // Unordered lists
  html=html.replace(/^[-*]\s(.+)$/gm,'<li>$1</li>');
  html=html.replace(/((<li>.*<\/li>\n?)+)/g,'<ul>$1</ul>');
  // Ordered lists
  html=html.replace(/^\d+\.\s(.+)$/gm,'<li>$1</li>');
  // Tables
  html=html.replace(/^\|(.+)\|$/gm,(m,content)=>{
    const cells=content.split('|').map(c=>c.trim());
    if(cells.every(c=>/^[-:]+$/.test(c)))return '';
    const tag=cells.length?'td':'td';
    return '<tr>'+cells.map(c=>`<${tag}>${c}</${tag}>`).join('')+'</tr>';
  });
  html=html.replace(/((<tr>.*<\/tr>\n?)+)/g,'<table>$1</table>');
  // Paragraphs
  html=html.replace(/^(?!<[a-z])(.*\S.*)$/gm,'<p>$1</p>');
  html=html.replace(/<\/p>\n<p>/g,'</p><p>');
  return html;
}
function render(){preview.innerHTML=parseMd(input.value);}
input.addEventListener('input',render);
// Initial render with sample
if(!input.value)input.value="# Welcome to Markdown Editor\n\nWrite **bold**, *italic*, or `inline code`.\n\n## Features\n- Live preview\n- Code blocks\n- Tables\n- Links & images\n\n```js\nconsole.log('Hello ToolWools!');\n```\n\n> This is a blockquote\n\n| Feature | Status |\n|---------|--------|\n| Headers | ✅ |\n| Lists | ✅ |\n| Code | ✅ |";
render();
document.getElementById('btn-copy-html').addEventListener('click',()=>{
  navigator.clipboard.writeText(preview.innerHTML).then(()=>showToast('HTML copied!','success'));
});
document.getElementById('btn-download').addEventListener('click',()=>{
  const blob=new Blob([input.value],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='document.md';a.click();
  showToast('Markdown file downloaded!','success');
});
});
