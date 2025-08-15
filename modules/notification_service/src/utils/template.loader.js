const ejs = require("ejs");
const path = require("path");

/**
 * Load template
 * @param {*} type
 * @param {*} templateName
 * @param {*} data
 */
const loadTemplate = async (type, templateName, data) => {
  try {
    const templatePath = path.join(
      __dirname,
      `../templates/${type.toLowerCase()}/${templateName.toLowerCase()}.template.ejs`,
    );
    return await ejs.renderFile(templatePath, data);
  } catch (error) {
    console.error(`Error loading Template: ${error.message}`);
    return null;
  }
};

module.exports = loadTemplate;
