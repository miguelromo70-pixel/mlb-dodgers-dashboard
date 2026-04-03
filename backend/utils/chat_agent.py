import os
import json
import anthropic
from utils import mlb_api

SYSTEM_PROMPT = """Eres un experto en béisbol y la MLB. Respondes siempre en español.
Tu especialidad es la Major League Baseball, con enfoque en los LA Dodgers.
Tienes acceso a herramientas para consultar estadísticas reales de la MLB Stats API.

Cuando el usuario pregunte sobre un jugador:
1. Primero búscalo por nombre para obtener su ID
2. Luego consulta su información biográfica o estadísticas según lo que pregunten

Sé conciso pero informativo. Usa datos reales, no inventes estadísticas.
Si no encuentras un jugador o dato, dilo honestamente."""

TOOLS = [
    {
        "name": "search_player",
        "description": "Busca un jugador de MLB por nombre. Devuelve una lista de jugadores que coinciden con el nombre.",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Nombre del jugador a buscar (ej: 'Ohtani', 'Freddie Freeman')",
                }
            },
            "required": ["name"],
        },
    },
    {
        "name": "get_player_info",
        "description": "Obtiene información biográfica de un jugador: edad, equipo, posición, lugar de nacimiento, debut, etc.",
        "input_schema": {
            "type": "object",
            "properties": {
                "player_id": {
                    "type": "integer",
                    "description": "ID del jugador en la MLB",
                }
            },
            "required": ["player_id"],
        },
    },
    {
        "name": "get_player_stats",
        "description": "Obtiene estadísticas de un jugador para una temporada específica o de carrera.",
        "input_schema": {
            "type": "object",
            "properties": {
                "player_id": {
                    "type": "integer",
                    "description": "ID del jugador en la MLB",
                },
                "season": {
                    "type": "integer",
                    "description": "Año de la temporada (ej: 2024). Si no se especifica, devuelve stats de carrera.",
                },
                "group": {
                    "type": "string",
                    "enum": ["hitting", "pitching", "fielding"],
                    "description": "Tipo de estadísticas. Default: hitting",
                },
            },
            "required": ["player_id"],
        },
    },
    {
        "name": "get_standings",
        "description": "Obtiene la tabla de posiciones de una división de la MLB.",
        "input_schema": {
            "type": "object",
            "properties": {
                "division": {
                    "type": "string",
                    "enum": ["al_east", "al_central", "al_west", "nl_east", "nl_central", "nl_west"],
                    "description": "División. Default: nl_west (Dodgers)",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_team_schedule",
        "description": "Obtiene el calendario de juegos recientes y próximos de los Dodgers.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
]


def handle_tool_call(tool_name, tool_input):
    """Ejecuta una herramienta y devuelve el resultado."""
    if tool_name == "search_player":
        results = mlb_api.search_player(tool_input["name"])
        simplified = []
        for p in results[:5]:
            simplified.append({
                "id": p.get("id"),
                "fullName": p.get("fullName"),
                "team": p.get("currentTeam", {}).get("name", "N/A"),
                "position": p.get("primaryPosition", {}).get("name", "N/A"),
                "active": p.get("active", False),
            })
        return json.dumps(simplified, ensure_ascii=False)

    elif tool_name == "get_player_info":
        info = mlb_api.get_player_info(tool_input["player_id"])
        return json.dumps(info, ensure_ascii=False) if info else "Jugador no encontrado"

    elif tool_name == "get_player_stats":
        season = tool_input.get("season")
        group = tool_input.get("group", "hitting")
        data = mlb_api.get_player_stats(tool_input["player_id"], season=season, group=group)
        stats_list = data.get("stats", [])
        if stats_list and stats_list[0].get("splits"):
            splits = stats_list[0]["splits"]
            result = []
            for split in splits:
                entry = {"season": split.get("season", "career"), "stats": split.get("stat", {})}
                team = split.get("team", {})
                if team:
                    entry["team"] = team.get("name", "")
                result.append(entry)
            return json.dumps(result, ensure_ascii=False)
        return "No se encontraron estadísticas"

    elif tool_name == "get_standings":
        division = tool_input.get("division", "nl_west")
        standings = mlb_api.get_standings(division)
        return json.dumps(standings, ensure_ascii=False)

    elif tool_name == "get_team_schedule":
        schedule = mlb_api.get_schedule()
        simplified = []
        for g in schedule:
            simplified.append({
                "date": g.get("game_date", ""),
                "away": g.get("away_name", ""),
                "home": g.get("home_name", ""),
                "score": f"{g.get('away_score', '')} - {g.get('home_score', '')}",
                "status": g.get("status", ""),
            })
        return json.dumps(simplified, ensure_ascii=False)

    return "Herramienta no reconocida"


def chat(messages, api_key=None):
    """Envía mensajes al agente y procesa tool use en un loop."""
    if api_key is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")

    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        tools=TOOLS,
        messages=messages,
    )

    # Loop de tool use
    while response.stop_reason == "tool_use":
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = handle_tool_call(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })

        messages = messages + [
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": tool_results},
        ]

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

    # Extraer texto de la respuesta final
    text_response = ""
    for block in response.content:
        if hasattr(block, "text"):
            text_response += block.text

    return text_response, messages + [{"role": "assistant", "content": response.content}]
