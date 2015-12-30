/// <reference path="sys.ts" />
/// <reference path="emitter.ts" />
/// <reference path="core.ts" />

namespace ts {
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

    function optimizeIfStatement(node: IfStatement) {
        let evaluatedValue = evaluateNode(node.expression);
        if (typeof evaluatedValue === "object") {
            return;
        }

        if (evaluatedValue) {
            replaceNode(node, node.thenStatement);
        }
        else {
            replaceNode(node, node.elseStatement);
        }
    }

    export function replaceNodeWithLiteral(node: Node, literal: any) {
        let literalType = typeof literal;

        if (literalType === "undefined") {
            // Undefined... Leave it untouched.
            return;
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
            (<LiteralExpression>node).text = "" + literal;
        }
        else if (literalType === "string") {
            node.kind = SyntaxKind.StringLiteral;
            node.parent = undefined;
            node.pos = -1;
            (<LiteralExpression>node).text = literal;
        }
        else {
            console.log("Failed to replace node", node, "with", literal);
        }
    }

    function optimizeExression(node: Expression) {
        let evaluatedValue = evaluateNode(node);
        if (typeof evaluatedValue === "object") {
            return;
        }

        replaceNodeWithLiteral(node, evaluatedValue);
    }

    export function optimizeNode(node: Node) {
        switch (node.kind) {
        case SyntaxKind.IfStatement:
            optimizeIfStatement(<IfStatement>node);
            break;
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.PrefixUnaryExpression:
            optimizeExression(<Expression>node);
            break;
        default:
            break;
        }

        forEachChild(node, (child) => {
            optimizeNode(child);
        });
    }
}
