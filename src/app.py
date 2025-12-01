from flask import Flask, jsonify
from flask_cors import CORS
from utils.system_metrics import get_disk_usage, get_ram_usage, get_cpu_usage, get_network_usage

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/stats')
def stats():
    """Unified endpoint that returns all system stats in one call"""
    return jsonify({
        'cpu': get_cpu_usage(),
        'ram': get_ram_usage(),
        'disk': get_disk_usage(),
        'network': get_network_usage()
    })

@app.route('/api/disk')
def disk():
    return jsonify(get_disk_usage())

@app.route('/api/ram')
def ram():
    return jsonify(get_ram_usage())

@app.route('/api/cpu')
def cpu():
    return jsonify(get_cpu_usage())

@app.route('/api/network')
def network():
    return jsonify(get_network_usage())

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    # Development server. In Docker we use gunicorn (see Dockerfile).
    app.run(host='0.0.0.0', port=5000, debug=True)
