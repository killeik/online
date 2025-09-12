import { IdAttributePlugin, RenderPlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
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

	eleventyConfig.addFilter("humandate", function(dateObj) {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
	});
	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

	eleventyConfig.addPlugin(RenderPlugin);
	// eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(IdAttributePlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed.xml",
		collection: {
			name: "all", // iterate over `collections.all` - all the pages
			limit: 0,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "killeik grimoire",
			subtitle: "personal magical book on the web",
			base: "https://killeik.net/",
			author: {
				name: "killeik",
				email: "qadol4zpb@mozmail.com", // Optional
			}
		}
	});

	let markdownOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};
	eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(MarkdownItMark));
	eleventyConfig.setLibrary("md", markdownIt(markdownOptions));
}
