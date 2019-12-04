module.exports = {
    verbose: true,
    transform: {
        ".(ts|tsx)": "ts-jest",
        "^.+\\.graphql$": "graphql-import-node/jest"
    },
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "json"
    ]
};