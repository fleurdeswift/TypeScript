//// [APISample_linter.ts]

/*
 * Note: This test is a public API sample. The sample sources can be found 
         at: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
 *       Please log a "breaking change" issue for any API breaking change affecting this issue
 */

declare var process: any;
declare var console: any;
declare var readFileSync: any;

import * as ts from "typescript";

export function delint(sourceFile: ts.SourceFile) {
    delintNode(sourceFile);

    function delintNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.ForStatement:
            case ts.SyntaxKind.ForInStatement:
            case ts.SyntaxKind.WhileStatement:
            case ts.SyntaxKind.DoStatement:
                if ((<ts.IterationStatement>node).statement.kind !== ts.SyntaxKind.Block) {
                    report(node, "A looping statement's contents should be wrapped in a block body.");
                }
                break;

            case ts.SyntaxKind.IfStatement:
                let ifStatement = (<ts.IfStatement>node);
                if (ifStatement.thenStatement.kind !== ts.SyntaxKind.Block) {
                    report(ifStatement.thenStatement, "An if statement's contents should be wrapped in a block body.");
                }
                if (ifStatement.elseStatement &&
                    ifStatement.elseStatement.kind !== ts.SyntaxKind.Block &&
                    ifStatement.elseStatement.kind !== ts.SyntaxKind.IfStatement) {
                    report(ifStatement.elseStatement, "An else statement's contents should be wrapped in a block body.");
                }
                break;

            case ts.SyntaxKind.BinaryExpression:
                let op = (<ts.BinaryExpression>node).operatorToken.kind;
                if (op === ts.SyntaxKind.EqualsEqualsToken || op == ts.SyntaxKind.ExclamationEqualsToken) {
                    report(node, "Use '===' and '!=='.")
                }
                break;
        }

        ts.forEachChild(node, delintNode);
    }

    function report(node: ts.Node, message: string) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
}

const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
    // Parse a file
    let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES6, /*setParentNodes */ true);

    // delint it
    delint(sourceFile);
});

//// [APISample_linter.js]
/*
 * Note: This test is a public API sample. The sample sources can be found
         at: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
 *       Please log a "breaking change" issue for any API breaking change affecting this issue
 */
var ts = require("typescript");
function delint(sourceFile) {
    delintNode(sourceFile);
    function delintNode(node) {
        switch (node.kind) {
            case 200 /* ForStatement */:
            case 201 /* ForInStatement */:
            case 199 /* WhileStatement */:
            case 198 /* DoStatement */:
                if (node.statement.kind !== 193 /* Block */) {
                    report(node, "A looping statement's contents should be wrapped in a block body.");
                }
                break;
            case 197 /* IfStatement */:
                var ifStatement = node;
                if (ifStatement.thenStatement.kind !== 193 /* Block */) {
                    report(ifStatement.thenStatement, "An if statement's contents should be wrapped in a block body.");
                }
                if (ifStatement.elseStatement &&
                    ifStatement.elseStatement.kind !== 193 /* Block */ &&
                    ifStatement.elseStatement.kind !== 197 /* IfStatement */) {
                    report(ifStatement.elseStatement, "An else statement's contents should be wrapped in a block body.");
                }
                break;
            case 182 /* BinaryExpression */:
                var op = node.operatorToken.kind;
                if (op === 30 /* EqualsEqualsToken */ || op == 31 /* ExclamationEqualsToken */) {
                    report(node, "Use '===' and '!=='.");
                }
                break;
        }
        ts.forEachChild(node, delintNode);
    }
    function report(node, message) {
        var _a = sourceFile.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
        console.log(sourceFile.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
    }
}
exports.delint = delint;
var fileNames = process.argv.slice(2);
fileNames.forEach(function (fileName) {
    // Parse a file
    var sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), 2 /* ES6 */, /*setParentNodes */ true);
    // delint it
    delint(sourceFile);
});
