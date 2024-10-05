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
}
