import markdownIt from "markdown-it";

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

  let markdownOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };

 eleventyConfig.setLibrary("md", markdownIt(markdownOptions ));
}
