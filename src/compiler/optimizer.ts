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

    function evaluateNode(node: Node): any {
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
                    let operandValue = evaluateNode(unaryExpression.operand);
                    if (typeof operandValue === "object") {
                        return node;
                    }

                    return !operandValue;
                }
            }
            break;

        case SyntaxKind.BinaryExpression:
            {
                let binaryExpression = <BinaryExpression>node;
                let leftValue = evaluateNode(binaryExpression.left);
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

                let rightValue = evaluateNode(binaryExpression.right);
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

            node.parent = undefined;
            node.pos = -1;
        }
        else if (literalType === "number") {
            node.kind = SyntaxKind.NumericLiteral;
            node.parent = undefined;
            node.pos = -1;
            (<LiteralExpression>node).text = String(literal);
        }
        else if (literalType === "string") {
            node.kind = SyntaxKind.StringLiteral;
            node.parent = undefined;
            node.pos = -1;
            (<LiteralExpression>node).text = <string>literal;
        }
        else {
            console.log("Failed to replace node", node, "with", literal);
        }
        
        return node;
    }

    function optimizeIfStatement(node: IfStatement, optimizations: Optimizations): Node {
        let evaluatedValue = evaluateNode(node.expression);
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

    function optimizeExression(node: Expression, optimizations: Optimizations): Node {
        let evaluatedValue = evaluateNode(node);
        if (!isLiteral(evaluatedValue)) {
            return node;
        }

        return replaceNodeWithLiteral(node, evaluatedValue);
    }
    
    function optimizeIdentifier(node: Identifier, typeChecker: TypeChecker, optimizations: Optimizations): Node {
        if (!node.parent || node.parent.kind === SyntaxKind.VariableDeclaration) {
            // Skip declaractions
            return node;
        }

        let symbol = typeChecker.getSymbolAtLocation(node);
        if (!symbol || !(symbol.flags & SymbolFlags.BlockScopedVariable) || !symbol.valueDeclaration) {
            // Skip symbol that don't have any value declarations
            return node;
        }
        
        let valueDecl = <VariableDeclaration>symbol.valueDeclaration;
        console.error(symbol.name, valueDecl.kind);
        if (!(valueDecl.flags & NodeFlags.Const) || !valueDecl.initializer) {
            // Skip non-const symbols
            return node;
        }
        
        let evaluatedValue = evaluateNode(valueDecl.initializer);
        if (!isLiteral(evaluatedValue)) {
            // Can't reduce the expression to a literal value
            return node;
        }
        
        return replaceNodeWithLiteral(node, evaluatedValue);
    }

    export function optimizeNode(node: Node, typeChecker: TypeChecker, optimizations: Optimizations): Node {
        switch (node.kind) {
        case SyntaxKind.IfStatement:
            node = optimizeIfStatement(<IfStatement>node, optimizations);
            break;
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.PrefixUnaryExpression:
            node = optimizeExression(<Expression>node, optimizations);
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
