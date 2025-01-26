import markdownIt from "markdown-it";
import { DateTime } from "luxon";

export const config = {
  dir: {
    input: "source",
    output: "public",
  },
};

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "source/_static/": "/" });
 
  eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});
	eleventyConfig.addPairedShortcode("ascii", function(content){
	 return `<pre class='ascii'>${content}</pre>` 
	})
	eleventyConfig.addPairedShortcode("widthtocontent", function(content){
	 return `<div class='widthtocontent'>${content}</div>` 
	})
	eleventyConfig.addPairedShortcode("sidebyside", function(content){
	 return `<div class='sidebyside'>${content}</div>` 
	})

  eleventyConfig.addFilter("humandate", function (dateObj){
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });	

  let markdownOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };

 eleventyConfig.setLibrary("md", markdownIt(markdownOptions ));
}
