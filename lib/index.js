/**
 * @fileoverview Downgrade errors to warning optionally when extending a config.
 * @author Antony Njuguna
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");
const path = require("path");

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

/**
 *
 * @param {string} modulePath
 * @param {number} severity either 1 or 2
 * @returns {void}
 */
function patch(modulePath, severity = 1) {
  const Linter = require(modulePath).Linter;

  console.log("updated version 2 major");

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
  Linter.prototype.verify = new Proxy(Linter.prototype.verify, handler);
}

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// Downgrade all errors to warnings by default
getEslintModulesPath().forEach(function (modulePath) {
  patch(modulePath);
});

module.exports.rules = requireIndex(__dirname + "/rules");
