import { IdAttributePlugin, RenderPlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { HtmlBasePlugin } from "@11ty/eleventy";
// import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
// 
import markdownIt from "markdown-it";
import MarkdownItMark from "markdown-it-mark";
//
import { DateTime } from "luxon";

export const config = {
	dir: {
		input: "source",
		output: "public",
	},
	htmlTemplateEngine: "liquid",
	markdownTemplateEngine: "liquid",
	dataTemplateEngine: "liquid",
	templateFormats: ["md", "liquid"] 
};

export default async function(eleventyConfig) {
	eleventyConfig.addPassthroughCopy({ "source/_static/": "/" });

	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft) {
			return false;
		}
	});

	eleventyConfig.addPairedShortcode("widthtocontent", function(content) {
		return `<div class='widthtocontent'>${content}</div>`
	});
	eleventyConfig.addPairedShortcode("sidebyside", function(content) {
		return `<div class='sidebyside'>${content}</div>`
	});
	eleventyConfig.addShortcode("youtube", function(id) {
		const videoId = String(id).trim();

		if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
			throw new Error(`Invalid YouTube video id: ${videoId}`);
		}

		return `<iframe class="youtube-embed" src="https://www.youtube-nocookie.com/embed/${videoId}" title="YouTube video" loading="lazy" allowfullscreen></iframe>`;
	});

	eleventyConfig.addCollection("redirects", function(collectionApi) {
		return collectionApi.getAll().flatMap((page) => {
			if (!page.data.redirectFrom) {
				return [];
			}

			return page.data.redirectFrom.map((from) => ({
				from,
				to: page.url,
			}));
		});
	});

	eleventyConfig.addFilter("humandate", function(dateObj) {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
	});
	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });
	eleventyConfig.addFilter("dateToRfc3339", pluginRss.dateToRfc3339);
	eleventyConfig.addFilter("dateToRfc822", pluginRss.dateToRfc822);
	eleventyConfig.addFilter("getNewestCollectionItemDate", pluginRss.getNewestCollectionItemDate)
	eleventyConfig.addPlugin(RenderPlugin);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(pluginRss);
	// eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(IdAttributePlugin);

	// eleventyConfig.addPlugin(feedPlugin, {
	// 	type: "atom", // or "rss", "json"
	// 	outputPath: "/feed.xml",
	// 	collection: {
	// 		name: "all", // iterate over `collections.all` - all the pages
	// 		limit: 0,     // 0 means no limit
	// 	},
	// 	metadata: {
	// 		language: "en",
	// 		title: "killeik grimoire",
	// 		subtitle: "personal magical book on the web",
	// 		base: "https://killeik.net/",
	// 		author: {
	// 			name: "killeik",
	// 			email: "qadol4zpb@mozmail.com", // Optional
	// 		}
	// 	}
	// });

	let markdownOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};
	eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(MarkdownItMark));
	eleventyConfig.setLibrary("md", markdownIt(markdownOptions));
}
