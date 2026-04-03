import statsapi
from datetime import datetime


DODGERS_ID = 119  # LA Dodgers team ID


def get_todays_games():
    """Devuelve todos los juegos de hoy."""
    today = datetime.now().strftime("%m/%d/%Y")
    games = statsapi.schedule(date=today)
    return games


def get_dodgers_game_today():
    """Busca el juego de los Dodgers hoy. Retorna None si no hay."""
    games = get_todays_games()
    for game in games:
        if game["home_id"] == DODGERS_ID or game["away_id"] == DODGERS_ID:
            return game
    return None


def get_live_game_data(game_id):
    """Obtiene datos en vivo de un juego específico."""
    import requests
    url = f"https://statsapi.mlb.com/api/v1.1/game/{game_id}/feed/live"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_linescore(game_data):
    """Extrae el linescore (score por inning, hits, errores)."""
    linescore = game_data.get("liveData", {}).get("linescore", {})
    return {
        "currentInning": linescore.get("currentInning", 0),
        "currentInningOrdinal": linescore.get("currentInningOrdinal", ""),
        "inningHalf": linescore.get("inningHalf", ""),
        "teams": {
            "home": {
                "runs": linescore.get("teams", {}).get("home", {}).get("runs", 0),
                "hits": linescore.get("teams", {}).get("home", {}).get("hits", 0),
                "errors": linescore.get("teams", {}).get("home", {}).get("errors", 0),
            },
            "away": {
                "runs": linescore.get("teams", {}).get("away", {}).get("runs", 0),
                "hits": linescore.get("teams", {}).get("away", {}).get("hits", 0),
                "errors": linescore.get("teams", {}).get("away", {}).get("errors", 0),
            },
        },
        "outs": linescore.get("outs", 0),
        "balls": linescore.get("balls", 0),
        "strikes": linescore.get("strikes", 0),
        "innings": linescore.get("innings", []),
    }


def get_runners(game_data):
    """Extrae las bases ocupadas."""
    linescore = game_data.get("liveData", {}).get("linescore", {})
    offense = linescore.get("offense", {})
    return {
        "first": offense.get("first", {}).get("fullName") if "first" in offense else None,
        "second": offense.get("second", {}).get("fullName") if "second" in offense else None,
        "third": offense.get("third", {}).get("fullName") if "third" in offense else None,
    }


def get_current_matchup(game_data):
    """Obtiene el matchup actual: pitcher vs batter."""
    linescore = game_data.get("liveData", {}).get("linescore", {})
    offense = linescore.get("offense", {})
    defense = linescore.get("defense", {})
    return {
        "batter": offense.get("batter", {}).get("fullName", "N/A"),
        "batter_id": offense.get("batter", {}).get("id"),
        "pitcher": defense.get("pitcher", {}).get("fullName", "N/A"),
        "pitcher_id": defense.get("pitcher", {}).get("id"),
    }


def get_play_by_play(game_data, last_n=10):
    """Obtiene las últimas N jugadas."""
    all_plays = game_data.get("liveData", {}).get("plays", {}).get("allPlays", [])
    recent = all_plays[-last_n:] if len(all_plays) > last_n else all_plays
    plays = []
    for play in recent:
        result = play.get("result", {})
        about = play.get("about", {})
        plays.append({
            "inning": about.get("halfInning", ""),
            "inning_num": about.get("inning", 0),
            "description": result.get("description", ""),
            "event": result.get("event", ""),
            "rbi": result.get("rbi", 0),
        })
    return plays


def get_boxscore(game_id):
    """Obtiene el boxscore de un juego."""
    return statsapi.boxscore_data(game_id)


def get_standings(division="nl_west"):
    """Obtiene standings. Por defecto NL West (Dodgers)."""
    division_map = {
        "al_east": 201, "al_central": 202, "al_west": 200,
        "nl_east": 204, "nl_central": 205, "nl_west": 203,
    }
    div_id = division_map.get(division, 203)
    import requests
    year = datetime.now().year
    url = f"https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season={year}"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    for record in data.get("records", []):
        if record.get("division", {}).get("id") == div_id:
            teams = []
            for tr in record.get("teamRecords", []):
                teams.append({
                    "name": tr["team"]["name"],
                    "wins": tr["wins"],
                    "losses": tr["losses"],
                    "pct": tr.get("winningPercentage", ""),
                    "gb": tr.get("gamesBack", "-"),
                    "streak": tr.get("streak", {}).get("streakCode", ""),
                })
            return teams
    return []


def search_player(name):
    """Busca un jugador por nombre."""
    results = statsapi.lookup_player(name)
    return results


def get_player_stats(player_id, season=None, group="hitting"):
    """Obtiene stats de un jugador para una temporada."""
    if season:
        stats_type = f"type=season&season={season}"
    else:
        stats_type = "type=career"
    import requests
    url = f"https://statsapi.mlb.com/api/v1/people/{player_id}/stats?stats={stats_type}&group={group}"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_player_info(player_id):
    """Obtiene información biográfica de un jugador."""
    import requests
    url = f"https://statsapi.mlb.com/api/v1/people/{player_id}"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if data.get("people"):
        person = data["people"][0]
        return {
            "fullName": person.get("fullName"),
            "birthDate": person.get("birthDate"),
            "age": person.get("currentAge"),
            "birthCity": person.get("birthCity"),
            "birthCountry": person.get("birthCountry"),
            "height": person.get("height"),
            "weight": person.get("weight"),
            "position": person.get("primaryPosition", {}).get("name"),
            "team": person.get("currentTeam", {}).get("name", "Free Agent"),
            "number": person.get("primaryNumber"),
            "batSide": person.get("batSide", {}).get("description"),
            "pitchHand": person.get("pitchHand", {}).get("description"),
            "mlbDebutDate": person.get("mlbDebutDate"),
            "active": person.get("active"),
        }
    return None


def get_team_roster(team_id=DODGERS_ID):
    """Obtiene el roster de un equipo."""
    roster = statsapi.roster(team_id)
    return roster


def get_schedule(team_id=DODGERS_ID, days_back=3, days_ahead=7):
    """Obtiene el calendario reciente y próximo de un equipo."""
    from datetime import timedelta
    start = (datetime.now() - timedelta(days=days_back)).strftime("%m/%d/%Y")
    end = (datetime.now() + timedelta(days=days_ahead)).strftime("%m/%d/%Y")
    games = statsapi.schedule(team=team_id, start_date=start, end_date=end)
    return games
