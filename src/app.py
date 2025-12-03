"""
Flask REST API application for system metrics.

Provides real-time system information (CPU, RAM, Disk, Network, OS)
via REST endpoints with Swagger/OpenAPI documentation.
"""

from flask import Flask
from flask_cors import CORS
from flask_restx import Api, Resource, fields
from utils.system_metrics import (
    get_disk_usage,
    get_ram_usage,
    get_cpu_usage,
    get_network_usage,
    get_os_info
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Flask-RESTX API with Swagger documentation
api = Api(
    app,
    version='1.0',
    title='System Metrics API',
    description=(
        'A REST API for retrieving live system metrics '
        '(CPU, RAM, Disk, Network) for desktop wallpaper displays'
    ),
    doc='/api',  # Swagger UI will be available at /api
    prefix='/api'
)

# Define API namespaces
ns = api.namespace('', description='System metrics operations')

# Define response models for Swagger documentation
# (matching actual data structure)
cpu_model = api.model('CPU', {
    'percent': fields.Float(
        description='Overall CPU usage percentage',
        example=45.2
    ),
    'per_cpu': fields.List(
        fields.Float,
        description='Per-core CPU usage percentages',
        example=[42.1, 48.3, 44.5, 46.7]
    ),
    'count': fields.Integer(
        description='Number of CPU cores',
        example=8
    )
})

ram_model = api.model('RAM', {
    'percent': fields.Float(
        description='RAM usage percentage',
        example=62.5
    ),
    'total': fields.Integer(
        description='Total RAM in bytes',
        example=17179869184
    ),
    'used': fields.Integer(
        description='Used RAM in bytes',
        example=10737418240
    ),
    'available': fields.Integer(
        description='Available RAM in bytes',
        example=6442450944
    )
})

disk_model = api.model('Disk', {
    'percent': fields.Float(
        description='Disk usage percentage',
        example=78.3
    ),
    'total': fields.Integer(
        description='Total disk space in bytes',
        example=536870912000
    ),
    'used': fields.Integer(
        description='Used disk space in bytes',
        example=420405657600
    ),
    'free': fields.Integer(
        description='Free disk space in bytes',
        example=116465254400
    )
})

network_model = api.model('Network', {
    'bytes_sent': fields.Integer(
        description='Total bytes sent',
        example=1048576
    ),
    'bytes_recv': fields.Integer(
        description='Total bytes received',
        example=2097152
    ),
    'packets_sent': fields.Integer(
        description='Total packets sent',
        example=1024
    ),
    'packets_recv': fields.Integer(
        description='Total packets received',
        example=2048
    )
})

os_model = api.model('OS', {
    'system': fields.String(
        description='Operating system name',
        example='Linux'
    ),
    'distro': fields.String(
        description='Distribution name',
        example='Ubuntu'
    ),
    'version': fields.String(
        description='Distribution version',
        example='24.04.3 LTS'
    ),
    'codename': fields.String(
        description='Distribution codename',
        example='Noble Numbat'
    ),
    'kernel': fields.String(
        description='Kernel version',
        example='6.8.0-49-generic'
    ),
    'architecture': fields.String(
        description='System architecture',
        example='x86_64'
    )
})

stats_model = api.model('Stats', {
    'cpu': fields.Nested(
        cpu_model,
        description='CPU metrics'
    ),
    'ram': fields.Nested(
        ram_model,
        description='RAM metrics'
    ),
    'disk': fields.Nested(
        disk_model,
        description='Disk metrics'
    ),
    'network': fields.Nested(
        network_model,
        description='Network metrics'
    ),
    'os': fields.Nested(
        os_model,
        description='Operating system information'
    )
})

health_model = api.model('Health', {
    'status': fields.String(
        description='API health status',
        example='ok'
    )
})


@ns.route('/stats')
class Stats(Resource):
    """Resource for retrieving all system statistics in one call."""

    @api.doc('get_all_stats')
    @api.marshal_with(stats_model)
    @api.response(200, 'Success')
    def get(self):
        """Get all system stats in one call (recommended)

        This unified endpoint returns CPU, RAM, Disk, and Network metrics
        in a single request, reducing API calls and improving performance
        for wallpaper displays.
        """
        return {
            'cpu': get_cpu_usage(),
            'ram': get_ram_usage(),
            'disk': get_disk_usage(),
            'network': get_network_usage(),
            'os': get_os_info()
        }


@ns.route('/cpu')
class CPU(Resource):
    """Resource for retrieving CPU usage statistics."""

    @api.doc('get_cpu')
    @api.marshal_with(cpu_model)
    @api.response(200, 'Success')
    def get(self):
        """Get CPU usage and information

        Returns current CPU usage percentage, core count, and frequency.
        """
        return get_cpu_usage()


@ns.route('/ram')
class RAM(Resource):
    """Resource for retrieving RAM usage statistics."""

    @api.doc('get_ram')
    @api.marshal_with(ram_model)
    @api.response(200, 'Success')
    def get(self):
        """Get RAM usage and information

        Returns memory usage percentage, total RAM, used RAM, and
        available RAM in GB.
        """
        return get_ram_usage()


@ns.route('/disk')
class Disk(Resource):
    """Resource for retrieving disk usage statistics."""

    @api.doc('get_disk')
    @api.marshal_with(disk_model)
    @api.response(200, 'Success')
    def get(self):
        """Get disk usage and information

        Returns disk usage percentage, total space, used space, and
        free space in GB.
        """
        return get_disk_usage()


@ns.route('/network')
class Network(Resource):
    """Resource for retrieving network I/O statistics."""

    @api.doc('get_network')
    @api.marshal_with(network_model)
    @api.response(200, 'Success')
    def get(self):
        """Get network I/O statistics

        Returns total bytes and packets sent/received since system boot.
        """
        return get_network_usage()


@ns.route('/os')
class OS(Resource):
    """Resource for retrieving operating system information."""

    @api.doc('get_os')
    @api.marshal_with(os_model)
    @api.response(200, 'Success')
    def get(self):
        """Get operating system information

        Returns distribution name, version, codename, kernel version,
        and architecture.
        """
        return get_os_info()


@ns.route('/health')
class Health(Resource):
    """Resource for API health check."""

    @api.doc('health_check')
    @api.marshal_with(health_model)
    @api.response(200, 'API is healthy')
    def get(self):
        """Health check endpoint

        Simple endpoint to verify the API is running and responsive.
        """
        return {'status': 'ok'}


if __name__ == '__main__':
    # Development server (localhost only for security)
    # In Docker we use gunicorn (see Dockerfile).
    app.run(host='127.0.0.1', port=5000, debug=True)
