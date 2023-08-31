import os
from dotenv import load_dotenv
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from datetime import datetime
import openai
import csv
from cluster import cluster

load_dotenv()

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
openai.api_key = os.environ.get('OPENAI_API_KEY')

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def generate_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response['data'][0]['embedding']


def run(): 
  message_history = client.messages.list()
  output_csv_path = './message_history.csv'

  with open(output_csv_path, 'w', newline='') as output_csv:
    # Write header row
    csv_writer = csv.writer(output_csv)
    csv_writer.writerow(['sid','body','direction','embedding']);

    for message in message_history:
        if message.body != "":
          print(message.body)
          embedding = generate_embedding(message.body);

          csv_writer.writerow([message.sid, message.body, message.direction] + [embedding]) 

    print('All messages downloaded and created with embeddings');

  clustered_results = cluster();
  return clustered_results
