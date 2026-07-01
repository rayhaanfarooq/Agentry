from agent.tools.compute import ComputeTool
from agent.tools.echo import EchoTool
from agent.tools.lookup import LookupTool
from agent.tools.registry import build_default_tool_registry
from agent.tools.schema import build_gemini_function_declarations


def test_echo_tool_returns_message() -> None:
    result = EchoTool().run({"message": "hello"})

    assert result.tool_name == "echo"
    assert result.output == {"message": "hello"}


def test_lookup_tool_returns_known_key() -> None:
    result = LookupTool().run({"key": "pricing"})
    output = result.output

    assert result.tool_name == "lookup"
    assert isinstance(output, dict)
    assert output["found"] is True
    assert "Pro plan" in str(output["value"])


def test_lookup_tool_returns_not_found_for_unknown_key() -> None:
    result = LookupTool().run({"key": "missing"})

    assert result.output == {"found": False, "key": "missing"}


def test_compute_tool_evaluates_expression() -> None:
    result = ComputeTool().run({"expression": "2 + 3 * 4"})

    assert result.tool_name == "compute"
    assert result.output == {"expression": "2 + 3 * 4", "value": 14.0}


def test_default_tool_registry_contains_expected_tools() -> None:
    registry = build_default_tool_registry()
    tool_names = [tool.name for tool in registry.list_tools()]

    assert tool_names == ["echo", "lookup", "compute"]


def test_build_gemini_function_declarations_includes_parameters() -> None:
    registry = build_default_tool_registry()
    declarations = build_gemini_function_declarations(registry)

    assert len(declarations) == 3
    echo_declaration = next(item for item in declarations if item["name"] == "echo")
    assert echo_declaration["parameters"]["required"] == ["message"]
