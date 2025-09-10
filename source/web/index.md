---
title: infinite-index
date: git Last Modified
created: 2024-09-12
layout: base.html
eleventyImport.collections: webindex
---

# ==[The Web Beyond Platforms](/thoughts/web_beyond_platforms)==
## INDEXING IN PROGRESS
### Be careful, some fireballs may appear!

<div>
{%- for post in collections.webindex -%}
<article class=test> 
<a href="{{ post.link }}"> <h3>{{ post.data.title }}</h3></a>
{{post.content}}
</article> 
{%- endfor -%}
</div>