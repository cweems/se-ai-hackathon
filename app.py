
import os
from flask import Flask, make_response, render_template, jsonify, request
from get_messages import run

template_dir = os.path.abspath('./message-intelligence/build/')
static_dir = os.path.abspath('./message-intelligence/build/static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response


@app.route("/")
def index():
  return render_template('index.html')

@app.route("/cluster/<accountSid>/<authToken>")
def cluster(accountSid, authToken):
    
    result = run(accountSid, authToken)

    response = jsonify(result)
    # response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=True)