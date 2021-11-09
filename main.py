import bottle
from api import flotilla_rest
from api import enable_cors

app = application = bottle.default_app()

if __name__ == '__main__':
    bottle.run(app = application, host = '0.0.0.0', port = 8000)