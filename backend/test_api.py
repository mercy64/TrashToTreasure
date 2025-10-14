"""No-op placeholder to avoid accidental execution during test discovery.

The original dev script performed runtime HTTP checks against the local
server and printed status information. That caused `manage.py test` to
attempt external connections during test discovery. Keep a no-op here so
the file can remain in the repo for manual use but won't execute on import.
"""


def run_checks():
    # Intentionally empty — use backend/api_test.py for manual checks.
    return


if __name__ == "__main__":
    run_checks()
