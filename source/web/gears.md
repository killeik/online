---
title: infinite-index
layout: base.html
collection: gears
eleventyImport.collections: gears
---
# {{collection}} 
{% sidebyside %}
{%- for post in collections[collection] -%}
<article class=card> 
	<a href="{{ post.data.link }}"> <h3>{{ post.data.title }}</h3></a>
	<a href="{{ post.url }}"> <p>{{ post.rawInput  }}</p> </a>
	{%- for tag in post.data.tags -%}
		{% if tag != 'webindex' %}
		<a class=gray href='/web/{{tag}}' > #{{tag}} </a> 
		{% endif %} 
	{%- endfor -%}
</article> 
{%- endfor -%}
{% endsidebyside %}
