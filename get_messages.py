import os
from dotenv import load_dotenv
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import openai

import numpy as np
import pandas as pd
from ast import literal_eval
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler


load_dotenv()

# TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
# TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
openai.api_key = os.environ.get('OPENAI_API_KEY')

embedding_cache = {}

def kMeansRes(scaled_data, k, alpha_k=0.06):
    '''
    Parameters 
    ----------
    scaled_data: matrix 
        scaled data. rows are samples and columns are features for clustering
    k: int
        current k for applying KMeans
    alpha_k: float
        manually tuned factor that gives penalty to the number of clusters
    Returns 
    -------
    scaled_inertia: float
        scaled inertia value for current k           
    '''
    
    inertia_o = np.square((scaled_data - scaled_data.mean(axis=0))).sum()
    # fit k-means
    kmeans = KMeans(n_clusters=k, random_state=0, n_init=10).fit(scaled_data)
    scaled_inertia = kmeans.inertia_ / inertia_o + alpha_k * k
    return scaled_inertia

def chooseBestKforKMeans(scaled_data, k_range):
    ans = []
    for k in k_range:
        scaled_inertia = kMeansRes(scaled_data, k)
        ans.append((k, scaled_inertia))
    results = pd.DataFrame(ans, columns = ['k','Scaled Inertia']).set_index('k')
    best_k = results.idxmin()[0]
    return best_k

def generate_embedding(text):
  response = openai.Embedding.create(
      input=text,
      model="text-embedding-ada-002"
  )
  return response['data'][0]['embedding']

def generate_summary(messages):
  summary = openai.Completion.create(
        engine="text-davinci-003",
        prompt=f'Briefly, what do these SMS messages have in common? If there is no commonality, respond with "Mixed message types"\n\nCustomer sms:\n"""\n{messages}\n"""\n\nTheme:',
        temperature=0,
        max_tokens=64,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
  )

  return summary["choices"][0]["text"].replace("\n", "")

def run(account_sid, auth_token):
  try:
    message_count = 0
    body = []
    direction = []
    embeddings = []
    message_dict = {}
    if account_sid != "AC123":
      client = Client(account_sid, auth_token)
      
      message_history = client.messages.list()

      for message in message_history:
          print(message.body)
          if message.body:
            message_count += 1
            if not message.body in embedding_cache:
              embedding = generate_embedding(message.body);
              embedding_cache[message.body] = embedding
            else:
              embedding = embedding_cache[message.body]
            
            body.append(message.body)
            direction.append(message.direction)
            embeddings.append([embedding])

      print('All messages downloaded and created with embeddings');
    else:
      message_count = 245

    message_dict['body'] = body
    message_dict['direction'] = direction
    message_dict['embedding'] = embeddings
    clustered_results = cluster(message_count, account_sid, message_dict);
    return clustered_results
  except Exception as err:
    print(f"Unexpected {err=}, {type(err)=}")
    raise

def cluster(message_count, account_sid, message_dict):
  n_clusters = 4
  msg_per_cluster = 5
  response = {}
  # load demo data if fake SID provided
  if account_sid != "AC123":
    datafile_path = "./message_history.csv"
    df = pd.DataFrame.from_dict(message_dict)
    df["embedding"] = df.embedding.apply(np.array)  # convert string to numpy array
  else:
    datafile_path = "./sample_messages_with_embeddings.csv"
    df = pd.read_csv(datafile_path)
    df["embedding"] = df.embedding.apply(literal_eval).apply(np.array)
  
  matrix = np.vstack(df.embedding.values)
  matrix.shape

  k_range = range(2,20)
  mms = MinMaxScaler()
  scaled_data = mms.fit_transform(matrix)
  best_k = chooseBestKforKMeans(scaled_data, k_range)

  kmeans = KMeans(n_clusters=best_k, init="k-means++", random_state=42, n_init=10)
  kmeans.fit(matrix)
  labels = kmeans.labels_
  df["Cluster"] = labels

  table_rows = []

  for i in range(best_k):
    entry = {}
    messages = "\n".join(
        df[df.Cluster == i]
        .body
        .sample(msg_per_cluster, random_state=42, replace=True)
        .values
    )
    
    entry['summary'] = generate_summary(messages)
    
    examples = []
    
    sample_cluster_rows = df[df.Cluster == i].sample(msg_per_cluster, random_state=42, replace=True)
    for j in range(msg_per_cluster):
        example = sample_cluster_rows.body.str[:160].values[j]

        if not example in examples:
          examples.append(sample_cluster_rows.body.str[:160].values[j])
          print(sample_cluster_rows.body.str[:160].values[j])
    
    entry['examples'] = examples;
    entry['length'] = len(df[df.Cluster == i]);
    entry['percent'] = len(df[df.Cluster == i]) / message_count
    table_rows.append(entry);

  response['clusters'] = table_rows
  response['message_count'] = message_count

  return response