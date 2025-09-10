---
permalink: sitemap.xml
eleventyImport.collections: all
baseurl: https://killeik.net
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
{% for page in collections.all %}
{% if page.data.draft != true  %}
<url>
	<loc>{{ baseurl }}{{ page.url | url }}</loc>
	<lastmod>{{ page.date | htmlDateString }}</lastmod>
</url>
{% endif %}
{% endfor %}
</urlset>
