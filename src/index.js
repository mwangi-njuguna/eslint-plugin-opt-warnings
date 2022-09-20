/**
 * @fileoverview Downgrade errors to warning optionally when extending a config.
 * @author Antony Njuguna
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// const requireIndex = require("requireindex");
const path = require("path");
// const util = require("node:util");
// const prototypeIndentifier = Symbol("linter.verify");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const ESLINT_SEARCH_STR = `${path.sep}node_modules${path.sep}eslint${path.sep}`;

function getEslintModulesPath() {
  const modulePaths = new Set();
  const moduleCacheKeys = Object.keys(require.cache);

  for (const modPath of moduleCacheKeys) {
    const index = modPath.indexOf(ESLINT_SEARCH_STR);

    if (index >= 0) {
      const eslintPath = modPath.substring(
        0,
        index + ESLINT_SEARCH_STR.length - 1
      );
      modulePaths.add(eslintPath);
    }
  }

  return [...modulePaths];
}

// function getEslintRules() {
//   const Linter = require("eslint").Linter;
//   const linter = new Linter();

//   const rules = linter.getRules();

//   /*
// Map {
//   'accessor-pairs' => { meta: { docs: [Object], schema: [Array] }, create: [Function: create] },
//   'array-bracket-newline' => { meta: { docs: [Object], schema: [Array] }, create: [Function: create] },
//   ...
// }
// */
//   return rules;
// }

/**
 *
 * @param {string} modulePath
 * @param {number} severity either 1 or 2
 * @returns {void}
 */
function patch(modulePath, severity = 1) {
  const Linter = require(modulePath).Linter;

  if (severity !== 1 && severity !== 2) {
    return;
  }

  const handler = {
    apply: function (target, thisArg, argumentsList) {
      const infoObjArray = Reflect.apply(target, thisArg, argumentsList);

      const patchedInfoArray = infoObjArray.map((infoObj) => ({
        ...infoObj,
        severity,
      }));
      return patchedInfoArray;
    },
  };
  // const handler = {
  //   get: function (target, prop, receiver) {
  //     if (prop === "verify") {
  //       const fn = Reflect.get(target, prop, receiver);
  //       return new Proxy(fn, verifyFnHandler);
  //     }
  //     return Reflect.get(target, prop, receiver);
  //   },
  // };
  // const proxy = new Proxy(Linter.prototype, handler);
  // return proxy;
  Linter.prototype.verify = new Proxy(Linter.prototype.verify, handler);
}

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// Downgrade all errors to warnings by default
getEslintModulesPath().forEach(function (modulePath) {
  patch(modulePath);
});

// if you want to opt out of the downgrade for certain files
// use opt-out-warnings rule in the the eslint config file
// for example:
//   "opt-out-warnings": ["error", { "files": ["*.js"] }]
//
//
//

// import all rules in lib/rules
// module.exports.rules = requireIndex(__dirname + "/rules");
module.exports = {
  rules: {
    // CAVEAT: By design rules are sandboxed and have access to only the rule context
    "opt-out-warnings": {
      // [<(true or false & 0 or 1)>, <[<files]>],
      // use this to override the default behavior of optin-warnings
      // can accept (true or false & 0 or 1)
      create: function (context) {
        const [filePatterns] = context.options;
        const fileName = context.getFilename();

        const micromatch = require("micromatch");
        const absoluteFilename = path.resolve(fileName);

        const isMatch =
          filePatterns.length > 0 &&
          micromatch.isMatch(absoluteFilename, filePatterns);

        // skip if file is not matched
        // else don't patch.

        // const rulesMap = context.getRules();

        // using cwd, check if nearest eslint config has opt-out-warnings rule

        return {
          // on new file trap all create function calls...how do we get the rules for the file?
          Program: function (node) {
            // this hook is called per file
            if (isMatch) {
              // loopsToReport.forEach((node) =>
              //   context.report({ node, messageId: "invalid" })
              // );
            }
            console.log("Program node", node);
            console.log("Program context", context);
            console.log("Program isMatch", isMatch);
          },
          // "*": (node) => {
          //   context.report({
          //     message: "😿",
          //     node,
          //   });
          // },
          //
        };
      },
    },
  },
};
