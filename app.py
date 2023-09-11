
import os
from flask import Flask, make_response, render_template, jsonify, request, json
from flask_parameter_validation import ValidateParameters, Route, Json, Query
from werkzeug.exceptions import HTTPException
from get_messages import run

template_dir = os.path.abspath('./ui/build/')
static_dir = os.path.abspath('./ui/build/static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "error": e.name,
        "message": e.description,
    })
    response.content_type = "application/json"
    return response

# Display demo UI
@app.route("/")
def index():
  return render_template('index.html')

# Handle 'Analyze Messages' request from front-end
@app.route("/cluster/<accountSid>/<authToken>")
@ValidateParameters()
def cluster(
    accountSid: str = Route(),
    authToken: str = Route()
  ):
    try:
      # 'run' kicks off the process to fetch and cluster messages
      result = run(accountSid, authToken)
      response = jsonify(result)
      return response
    except Exception as err:
      return jsonify({"error": "Internal Server Error", "message": str(err)}), 500

if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=True)