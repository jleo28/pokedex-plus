import json
import os
import joblib
import numpy as np
from http.server import BaseHTTPRequestHandler

# Load models at cold start (module scope = cached across warm invocations)
_dir = os.path.dirname(__file__)
_bst_model = joblib.load(os.path.join(_dir, 'models', 'bst_regressor.pkl'))
_leg_model = joblib.load(os.path.join(_dir, 'models', 'legendary_classifier.pkl'))


def _predict(hp, attack, defense, sp_attack, sp_defense, speed):
    import pandas as pd

    bst_input = pd.DataFrame([{
        'type_primary':   'normal',
        'type_secondary': 'none',
        'generation':     1,
        'is_legendary':   0,
        'height_dm':      10,
        'weight_hg':      100,
    }])
    # BST regressor was trained on type/gen/height/weight features, not raw stats.
    # For the predictor we compute a rough BST from raw stats and use the legendary
    # classifier (which takes raw stats) as the primary signal. The BST regressor
    # serves the /lab page's model explainer; for the interactive predictor we use
    # the stat sum as predicted_bst (honest) and the classifier for the fun part.
    raw_bst = hp + attack + defense + sp_attack + sp_defense + speed

    leg_input = np.array([[hp, attack, defense, sp_attack, sp_defense, speed,
                           raw_bst, 10, 100]])
    leg_prob = float(_leg_model.predict_proba(leg_input)[0][1])
    leg_pred = bool(_leg_model.predict(leg_input)[0])

    return {
        'predicted_bst': raw_bst,
        'predicted_legendary': leg_pred,
        'predicted_legendary_prob': round(leg_prob, 4),
    }


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))

            required = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed']
            missing = [k for k in required if k not in body]
            if missing:
                self._respond(400, {'error': f"Missing fields: {missing}"})
                return

            result = _predict(
                int(body['hp']), int(body['attack']), int(body['defense']),
                int(body['sp_attack']), int(body['sp_defense']), int(body['speed']),
            )
            self._respond(200, result)

        except (json.JSONDecodeError, ValueError) as e:
            self._respond(400, {'error': str(e)})
        except Exception as e:
            self._respond(500, {'error': str(e)})

    def do_GET(self):
        self._respond(200, {'status': 'ok', 'endpoint': 'POST /api/predict'})

    def _respond(self, status: int, data: dict):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # suppress default access log noise
