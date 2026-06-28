from agent.tools.calculator import CalculatorTool
from agent.tools.registry import build_default_tool_registry
from agent.tools.weather import WeatherTool


def test_calculator_tool_evaluates_expression() -> None:
    result = CalculatorTool().run("2 + 3 * 4")

    assert result.tool_name == "calculator"
    assert result.output == "2 + 3 * 4 = 14.0"


def test_weather_tool_returns_mock_forecast() -> None:
    result = WeatherTool().run("Toronto")

    assert result.tool_name == "weather"
    assert "Toronto" in result.output


def test_default_tool_registry_contains_expected_tools() -> None:
    registry = build_default_tool_registry()
    tool_names = [tool.name for tool in registry.list_tools()]

    assert tool_names == [
        "current_time",
        "random_number",
        "weather",
        "calculator",
    ]
