/// <reference path="sys.ts" />
/// <reference path="emitter.ts" />
/// <reference path="core.ts" />

namespace ts {
    function isLiteral(value: any): boolean {
        return typeof value !== "object";
    }

    export function replaceNode(oldNode: Node, newNode: Node): boolean {
        let parentNode = oldNode.parent;

        for (let property in parentNode) {
            let propertyValue: any = (<any>parentNode)[property];
            if (propertyValue === oldNode) {
                (<any>parentNode)[property] = newNode;
                return true;
            }
            else if (Array.isArray(propertyValue)) {
                let index = propertyValue.indexOf(oldNode);
                if (index >= 0) {
                    propertyValue[index] = newNode;
                    return true;
                }
            }
        }

        console.log("Failed to optimize", oldNode, "by", newNode);
        return false;
    }

    function evaluateIdentifier(identifier: Identifier, typeChecker: TypeChecker, optimizations: Optimizations): any {
        if (!identifier.parent || identifier.parent.kind === SyntaxKind.VariableDeclaration) {
            // Skip declaractions
            return identifier;
        }

        let symbol = typeChecker.getSymbolAtLocation(identifier);
        if (!symbol || !(symbol.flags & SymbolFlags.BlockScopedVariable) || !symbol.valueDeclaration) {
            // Skip symbol that don't have any value declarations
            return identifier;
        }

        let valueDecl = <VariableDeclaration>symbol.valueDeclaration;
        if (!(valueDecl.kind === SyntaxKind.VariableDeclaration) || !valueDecl.initializer) {
            return identifier;
        }

        let valueDeclList = <VariableDeclarationList>valueDecl.parent;
        if (!(valueDeclList.kind === SyntaxKind.VariableDeclarationList) || !(valueDeclList.flags & NodeFlags.Const)) {
            // Skip non-const symbols
            return identifier;
        }

        let evaluatedValue = evaluateNode(valueDecl.initializer, typeChecker, optimizations);
        if (!isLiteral(evaluatedValue)) {
            // Can't reduce the expression to a literal value
            return identifier;
        }

        return evaluatedValue;
    }

    function evaluateNode(node: Node, typeChecker: TypeChecker, optimizations: Optimizations): any {
        switch (node.kind) {
        case SyntaxKind.TrueKeyword:
            return true;
        case SyntaxKind.FalseKeyword:
            return false;
        case SyntaxKind.StringLiteral:
            return String((<StringLiteral>node).text);
        case SyntaxKind.NumericLiteral:
            return Number((<LiteralExpression>node).text);
        case SyntaxKind.PrefixUnaryExpression:
            {
                let unaryExpression = <PrefixUnaryExpression>node;
                if (unaryExpression.operator === SyntaxKind.ExclamationToken) {
                    let operandValue = evaluateNode(unaryExpression.operand, typeChecker, optimizations);
                    if (typeof operandValue === "object") {
                        return node;
                    }

                    return !operandValue;
                }
            }
            break;

        case SyntaxKind.Identifier:
            return evaluateIdentifier(<Identifier>node, typeChecker, optimizations);

        case SyntaxKind.BinaryExpression:
            {
                let binaryExpression = <BinaryExpression>node;
                let leftValue = evaluateNode(binaryExpression.left, typeChecker, optimizations);
                if (typeof leftValue === "object") {
                    return node;
                }

                switch (binaryExpression.operatorToken.kind) {
                case SyntaxKind.AmpersandAmpersandToken:
                    if (!leftValue) {
                        return leftValue;
                    }
                    break;

                case SyntaxKind.BarBarToken:
                    if (leftValue) {
                        return leftValue;
                    }
                    break;
                }

                let rightValue = evaluateNode(binaryExpression.right, typeChecker, optimizations);
                if (typeof rightValue === "object") {
                    return node;
                }

                switch (binaryExpression.operatorToken.kind) {
                case SyntaxKind.AmpersandAmpersandToken:
                    return leftValue && rightValue;
                case SyntaxKind.AmpersandToken:
                    return leftValue & rightValue;
                case SyntaxKind.BarBarToken:
                    return leftValue || rightValue;
                case SyntaxKind.BarToken:
                    return leftValue | rightValue;
                case SyntaxKind.ExclamationEqualsEqualsToken:
                    return leftValue !== rightValue;
                case SyntaxKind.ExclamationEqualsToken:
                    return leftValue != rightValue;
                case SyntaxKind.EqualsEqualsEqualsToken:
                    return leftValue === rightValue;
                case SyntaxKind.EqualsEqualsToken:
                    return leftValue == rightValue;
                case SyntaxKind.CaretEqualsToken:
                    return leftValue ^= rightValue;
                case SyntaxKind.LessThanToken:
                    return leftValue < rightValue;
                case SyntaxKind.LessThanEqualsToken:
                    return leftValue <= rightValue;
                case SyntaxKind.GreaterThanToken:
                    return leftValue > rightValue;
                case SyntaxKind.GreaterThanEqualsToken:
                    return leftValue >= rightValue;
                default:
                    break;
                }
            }
            break;
        }

        return node;
    }

    export function replaceNodeWithLiteral(node: Node, literal: boolean | number | string): Node {
        let literalType = typeof literal;

        if (literalType === "undefined") {
            // Undefined... Leave it untouched.
            return node;
        }
        else if (literalType === "boolean") {
            if (literal) {
                node.kind = SyntaxKind.TrueKeyword;
            }
            else {
                node.kind = SyntaxKind.FalseKeyword;
            }
        }
        else if (literalType === "number") {
            node.kind = SyntaxKind.NumericLiteral;
            (<LiteralExpression>node).text = String(literal);
        }
        else if (literalType === "string") {
            node.kind = SyntaxKind.StringLiteral;
            (<LiteralExpression>node).text = <string>literal;
        }
        else {
            console.log("Failed to replace node", node, "with", literal);
        }

        return node;
    }

    function optimizeIfStatement(node: IfStatement, typeChecker: TypeChecker, optimizations: Optimizations): Node {
        let evaluatedValue = evaluateNode(node.expression, typeChecker, optimizations);
        if (!isLiteral(evaluatedValue)) {
            return node;
        }

        if (evaluatedValue) {
            if (replaceNode(node, node.thenStatement)) {
                return node.thenStatement;
            }
        }
        else {
            if (replaceNode(node, node.elseStatement)) {
                return node.elseStatement;
            }
        }

        return node;
    }

    function optimizeExression(node: Expression, typeChecker: TypeChecker, optimizations: Optimizations): Node {
        let evaluatedValue = evaluateNode(node, typeChecker, optimizations);
        if (!isLiteral(evaluatedValue)) {
            return node;
        }

        return replaceNodeWithLiteral(node, evaluatedValue);
    }

    function optimizeIdentifier(node: Identifier, typeChecker: TypeChecker, optimizations: Optimizations): Node {
        let evaluatedValue = evaluateIdentifier(node, typeChecker, optimizations);
        if (!isLiteral(evaluatedValue)) {
            // Can't reduce the expression to a literal value
            return node;
        }

        switch (node.parent.kind) {
            case SyntaxKind.CallExpression:
            case SyntaxKind.BinaryExpression:
                return replaceNodeWithLiteral(node, evaluatedValue);
            default:
                return node;
        }
    }

    export function optimizeNode(node: Node, typeChecker: TypeChecker, optimizations: Optimizations): Node {
        switch (node.kind) {
        case SyntaxKind.IfStatement:
            node = optimizeIfStatement(<IfStatement>node, typeChecker, optimizations);
            break;
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.PrefixUnaryExpression:
            node = optimizeExression(<Expression>node, typeChecker, optimizations);
            break;
        case SyntaxKind.Identifier:
            node = optimizeIdentifier(<Identifier>node, typeChecker, optimizations)
            break;
        default:
            break;
        }

        forEachChild(node, (child) => {
            optimizeNode(child, typeChecker, optimizations);
        });

        return node;
    }
}
