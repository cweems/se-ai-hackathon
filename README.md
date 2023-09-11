# Twilio Messaging Intelligence Demo
Analyze messages by use-case!

## Problem Statement
Many customers and Twilions struggle to understand what the use-case for an Account SID is. For example, a customer might want to answer the question "What does this account do?" and subsequently need to read raw message logs, and look at phone number configuration to find an answer. This can be even more difficult if the account has many use-cases, e.g. marketing, customer satisfaction surveys, and support channels.

## Our Solution
Our aim was to create a proof-of-concept that would take all messages from a Twilio account and cluster them into related use-cases. The output is a simple table which provides the use-case, frequency of message traffic related to that use-case, and a series of sample messages:

<img width="1750" alt="Screenshot of the demo app showing a pane where a user could enter the Account SID and AuthToken, press Analyze Use Cases, and see a table of use case results" src="https://github.com/cweems/se-ai-hackathon/assets/1418949/7aff0ef5-2ca2-4fdc-8e44-891db7a7a3ae">

The use cases generated are not pre-determined, and the number of use case clusters is determined automatically.

## How it Works
![Messaging Intelligence Process (1)](https://github.com/cweems/se-ai-hackathon/assets/1418949/967f6412-9274-4a3b-a25c-c0838b006387)

The app conducts the following processes to generate the use case groups:

1. Pull all message logs from a Twilio account using the provided Account SID.
1. For each message, call the OpenAI embeddings API to generate an embedding based on the message body. Note: we cache embedding responses, so that duplicate messages only call the OpenAI API once.
1. We determine the best number of clusters by tring KMeans clustering with different K values and calculating the intertia of each cluster. A penalty is applied so that we do not keep splitting messages into clusters if there are diminishing returns.
1. We cluster the messages using the dynamic K value, and provide sample messages from each cluster.
1. We pass the sample messages to OpenAI DaVinci to summarize the commonalities of messages in the cluster.
1. We post-process the data to return unique examples for each cluster, as well as the % of message logs that are categorized as being from that cluster. The backend returns a table to be displayed in the UI.

## Running the Demo
The demo is currently deployed [here](https://twilio-messaging-intelligence.fly.dev/). DO NOT USE WITH PRODUCTION DATA. All message data will be sent to OpenAI for processing, and may be temporarily stored on fly.io.

If you want to display some sample results, enter `AC123` as the account SID and any value as the Auth Token. This will process a CSV of mock message logs and display results, just as if you had entered a real Twilio Account.

## Setting Up for Development
Install backend dependencies:
```bash
# Clone the repository

# Change into project directory

# Create a python virtual environment:
python -m venv env

# Activate the virtual environment:
source env/bin/activate

# Install dependencies with pip:
pip install -r requirements.txt

# Add environemnt variables:
cp .env.example .env

# Place your OpenAI API key in the .env file
```

In a separate terminal tab, set up the front-end app:

```bash
# Switch to ui directory:
cd ui

# Install front-end dependencies:
npm install

# Build front-end app templates for backend to serve:
npm run build
```

Start flask app:
```python
python app.py
```