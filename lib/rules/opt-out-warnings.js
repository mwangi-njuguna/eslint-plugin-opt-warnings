const path = require("path");

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "rule to opt out of downgrading warnings to errors",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [
      {
        minItems: 1,
        type: "array",
        uniqueItems: true,
        items: { type: "string" },
      },
    ],
    messages: {
      [undefined]: "This is to silence linter errors",
    },
  },

  create: function (context) {
    const [filePatterns] = context.options;
    const fileName = context.getFilename();
    const absoluteFilename = path.resolve(fileName);

    const isMatch =
      filePatterns.length > 0 &&
      require("micromatch").isMatch(absoluteFilename, filePatterns);

    console.log("isMatch", isMatch);

    return {
      Program() {
        console.log("isMatch", isMatch);
      },
    };
  },
};
