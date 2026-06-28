from __future__ import annotations

import ast
import operator
from collections.abc import Callable

from agent.models.tool import ToolResult
from agent.tools.base import Tool

BINARY_OPERATOR = Callable[[float, float], float]
UNARY_OPERATOR = Callable[[float], float]

ALLOWED_BINARY_OPERATORS: dict[type[ast.operator], BINARY_OPERATOR] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

ALLOWED_UNARY_OPERATORS: dict[type[ast.unaryop], UNARY_OPERATOR] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


class CalculatorTool(Tool):
    name = "calculator"
    description = "Evaluate a simple arithmetic expression."

    def run(self, arguments: str | None = None) -> ToolResult:
        expression = (arguments or "1 + 1").strip()
        value = self._evaluate(ast.parse(expression, mode="eval").body)

        return ToolResult(
            tool_name=self.name,
            output=f"{expression} = {value}",
        )

    def _evaluate(self, node: ast.AST) -> float:
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)

        if isinstance(node, ast.BinOp):
            binary_operator = ALLOWED_BINARY_OPERATORS.get(type(node.op))
            if binary_operator is None:
                raise ValueError("Unsupported operator in calculator expression.")
            left = self._evaluate(node.left)
            right = self._evaluate(node.right)
            return float(binary_operator(left, right))

        if isinstance(node, ast.UnaryOp):
            unary_operator = ALLOWED_UNARY_OPERATORS.get(type(node.op))
            if unary_operator is None:
                raise ValueError("Unsupported unary operator in calculator expression.")
            return float(unary_operator(self._evaluate(node.operand)))

        raise ValueError("Unsupported calculator expression.")
