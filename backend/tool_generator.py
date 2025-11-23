import inspect
from typing import Any, Dict, List, Callable, get_type_hints


def generate_tools_from_fetchers(
    fetchers: Dict[str, Any]
) -> tuple[List[Dict[str, Any]], Dict[str, Callable]]:
    """
    Dynamically generate LiteLLM tool schemas and function mappings from fetcher instances.
    
    Args:
        fetchers: Dict mapping fetcher names to fetcher instances
        
    Returns:
        Tuple of (tools array, available_functions dict)
    """
    tools = []
    available_functions = {}
    
    # Exclude internal/helper methods
    excluded_methods = {
        "is_authenticated", "clear_token", "search_team",
        "get_authorization_url", "fetch_token_from_code", "get_spotify_client"
    }
    
    for fetcher_name, fetcher in fetchers.items():
        methods = inspect.getmembers(fetcher, predicate=inspect.ismethod)
        
        for method_name, method in methods:
            if method_name.startswith("_") or method_name in excluded_methods:
                continue
            
            if not method_name.startswith("fetch_") and not method_name.startswith("get_"):
                continue
            
            tool_name = f"{fetcher_name}_{method_name}"
            doc = inspect.getdoc(method) or f"Get data from {fetcher_name}"
            
            sig = inspect.signature(method)
            params = {}
            required_params = []
            
            for param_name, param in sig.parameters.items():
                if param_name == "self":
                    continue
                
                param_type = "string"
                param_desc = f"Parameter {param_name}"
                param_schema = {"type": param_type, "description": param_desc}
                
                annotation = param.annotation
                if annotation != inspect.Parameter.empty:
                    if annotation == str:
                        param_type = "string"
                    elif annotation == int:
                        param_type = "integer"
                    elif annotation == float:
                        param_type = "number"
                    elif annotation == bool:
                        param_type = "boolean"
                    elif hasattr(annotation, "__origin__"):
                        if annotation.__origin__ == list:
                            param_schema = {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": f"List of {param_name}"
                            }
                
                if "type" not in param_schema or param_schema.get("type") != "array":
                    param_schema = {"type": param_type, "description": param_desc}
                
                params[param_name] = param_schema
                
                if param.default == inspect.Parameter.empty:
                    required_params.append(param_name)
            
            tool_schema = {
                "type": "function",
                "function": {
                    "name": tool_name,
                    "description": doc.split('\n')[0] if doc else f"Execute {method_name}"
                }
            }
            
            if params:
                tool_schema["function"]["parameters"] = {
                    "type": "object",
                    "properties": params,
                    "required": required_params
                }
            
            tools.append(tool_schema)
            available_functions[tool_name] = method
    
    return tools, available_functions
