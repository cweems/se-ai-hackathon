
import os
from flask import Flask, render_template


template_dir = os.path.abspath('./message-intelligence/public/')

app = Flask(__name__, template_folder=template_dir)

@app.route("/")
def hello_world():
    return render_template('index.html')