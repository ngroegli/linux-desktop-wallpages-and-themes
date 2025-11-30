import psutil


def get_disk_usage():
    """Return disk usage for the root partition."""
    du = psutil.disk_usage('/')
    return {
        'total': du.total,
        'used': du.used,
        'free': du.free,
        'percent': du.percent,
    }


def get_ram_usage():
    vm = psutil.virtual_memory()
    return {
        'total': vm.total,
        'available': vm.available,
        'used': vm.used,
        'percent': vm.percent,
    }


def get_cpu_usage():
    # Overall percent (short sample) + per-cpu breakdown
    overall = psutil.cpu_percent(interval=0.5)
    per_cpu = psutil.cpu_percent(interval=0.5, percpu=True)
    return {
        'percent': overall,
        'per_cpu': per_cpu,
        'count': psutil.cpu_count(logical=True),
    }


def get_network_usage():
    net = psutil.net_io_counters(pernic=False)
    return {
        'bytes_sent': net.bytes_sent,
        'bytes_recv': net.bytes_recv,
        'packets_sent': net.packets_sent,
        'packets_recv': net.packets_recv,
    }
