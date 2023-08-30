
import os
from flask import Flask, render_template
from cluster import run

template_dir = os.path.abspath('./message-intelligence/public/')

app = Flask(__name__, template_folder=template_dir)

@app.route("/cluster")
def cluster():
    return run('index.html')