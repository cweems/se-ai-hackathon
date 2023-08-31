import os
import numpy as np
import pandas as pd
from ast import literal_eval
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.environ.get('OPENAI_API_KEY')

def cluster():
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

  result = []

  for i in range(n_clusters):
      entry = {}
      messages = "\n".join(
          df[df.Cluster == i]
          .body
          .sample(rev_per_cluster, random_state=42)
          .values
      )
      response = openai.Completion.create(
          engine="text-davinci-003",
          prompt=f'Briefly, what do these SMS messages have in common and what is the general theme?\n\nCustomer sms:\n"""\n{messages}\n"""\n\nTheme:',
          temperature=0,
          max_tokens=64,
          top_p=1,
          frequency_penalty=0,
          presence_penalty=0,
      )

      entry['summary'] = response["choices"][0]["text"].replace("\n", "")
      examples = []
      sample_cluster_rows = df[df.Cluster == i].sample(rev_per_cluster, random_state=42)
      for j in range(rev_per_cluster):
          examples.append(sample_cluster_rows.body.str[:160].values[j])
          print(sample_cluster_rows.body.str[:160].values[j])
      
      entry['examples'] = examples;
      result.append(entry);
      entry['length'] = len(df[df.Cluster == i]);
     
  return result

cluster()