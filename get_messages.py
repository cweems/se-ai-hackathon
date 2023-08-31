import os
from dotenv import load_dotenv
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import openai
import csv

import numpy as np
import pandas as pd
from ast import literal_eval
from sklearn.cluster import KMeans

load_dotenv()

# TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
# TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
openai.api_key = os.environ.get('OPENAI_API_KEY')

embedding_cache = {}

def generate_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response['data'][0]['embedding']


def run(account_sid, auth_token):
  message_count = 0
  client = Client(account_sid, auth_token)
  
  message_history = client.messages.list()
  output_csv_path = './message_history.csv'

  with open(output_csv_path, 'w', newline='') as output_csv:
    # Write header row
    csv_writer = csv.writer(output_csv)
    csv_writer.writerow(['sid','body','direction','embedding']);

    for message in message_history:
        print(message.body)
        message_count += 1
        if not message.body in embedding_cache:
          embedding = generate_embedding(message.body);
          embedding_cache[message.body] = embedding
        else:
          embedding = embedding_cache[message.body]
        

        csv_writer.writerow([message.sid, message.body, message.direction] + [embedding]) 

    print('All messages downloaded and created with embeddings');

  clustered_results = cluster(message_count);
  return clustered_results

def cluster(message_count):
  # load data
  datafile_path = "./message_history.csv"
  df = pd.read_csv(datafile_path)
  df["embedding"] = df.embedding.apply(literal_eval).apply(np.array)  # convert string to numpy array

  matrix = np.vstack(df.embedding.values)
  matrix.shape

  n_clusters = 4
  rev_per_cluster = 5

  kmeans = KMeans(n_clusters=n_clusters, init="k-means++", random_state=42, n_init=10)
  kmeans.fit(matrix)
  labels = kmeans.labels_
  df["Cluster"] = labels

  response = {}
  result = []

  for i in range(n_clusters):
      entry = {}
      messages = "\n".join(
          df[df.Cluster == i]
          .body
          .sample(rev_per_cluster, random_state=42)
          .values
      )
      summary = openai.Completion.create(
          engine="text-davinci-003",
          prompt=f'Briefly, what do these SMS messages have in common? If there is no commonality, respond with "Mixed message types"\n\nCustomer sms:\n"""\n{messages}\n"""\n\nTheme:',
          temperature=0,
          max_tokens=64,
          top_p=1,
          frequency_penalty=0,
          presence_penalty=0,
      )

      entry['summary'] = summary["choices"][0]["text"].replace("\n", "")
      examples = []
      sample_cluster_rows = df[df.Cluster == i].sample(rev_per_cluster, random_state=42)
      for j in range(rev_per_cluster):
          example = sample_cluster_rows.body.str[:160].values[j]

          if not example in examples:
            examples.append(sample_cluster_rows.body.str[:160].values[j])
            print(sample_cluster_rows.body.str[:160].values[j])
      
      entry['examples'] = examples;
      result.append(entry);
      entry['length'] = len(df[df.Cluster == i]);
      entry['percent'] = len(df[df.Cluster == i]) / message_count

  response['clusters'] = result
  response['message_count'] = message_count
  return response